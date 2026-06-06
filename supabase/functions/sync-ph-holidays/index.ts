import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Holidays from 'https://esm.sh/date-holidays@3.30.2'

const hd = new Holidays('PH')

interface HolidayData {
  date: string
  name: string
  type: 'regular_holiday' | 'special_non_working' | 'special_working'
}

/**
 * Sync Philippine statutory holidays for a given year to company_holidays table
 *
 * POST /functions/v1/sync-ph-holidays
 * Body: { tenant_id: "uuid", year: 2026 }
 */
Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  try {
    const { tenant_id, year } = await req.json()

    if (!tenant_id || !year) {
      return new Response(
        JSON.stringify({ error: 'Missing tenant_id or year' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 1. Get PH holidays for the year
    const phHolidays = getPHHolidaysForYear(year)

    // 2. Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 3. Soft-delete old statutory holidays for this tenant and year
    const yearStart = `${year}-01-01`
    const yearEnd = `${year}-12-31`

    const { error: deleteError } = await supabase
      .from('company_holidays')
      .update({ deleted_at: new Date().toISOString() })
      .eq('tenant_id', tenant_id)
      .eq('source', 'statutory')
      .gte('date', yearStart)
      .lte('date', yearEnd)

    if (deleteError) {
      console.error('Delete error:', deleteError)
    }

    // 4. Insert fresh statutory holidays
    const holidaysToInsert = phHolidays.map((h) => ({
      tenant_id,
      date: h.date,
      name: h.name,
      type: h.type,
      source: 'statutory',
      scope: 'company',
      recurring: false,
    }))

    const { error: insertError, data } = await supabase
      .from('company_holidays')
      .insert(holidaysToInsert)
      .select('id')

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: `Failed to insert holidays: ${insertError.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        synced: phHolidays.length,
        year,
        tenant_id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

/**
 * Get PH holidays for a given year
 * Maps DOLE holiday types to our schema
 */
function getPHHolidaysForYear(year: number): HolidayData[] {
  const holidays: HolidayData[] = []

  try {
    // Get all holidays for the year using the correct API
    const allHolidays = hd.getHolidays(year)

    // allHolidays is typically an array of objects with { date, name } or an object with date keys
    const holidayEntries = Array.isArray(allHolidays)
      ? allHolidays
      : Object.entries(allHolidays).map(([dateStr, name]) => ({
          date: dateStr,
          name: name as string,
        }))

    holidayEntries.forEach((holiday: any) => {
      // Parse date (could be string or Date object)
      let dateStr: string
      if (holiday.date instanceof Date) {
        dateStr = holiday.date.toISOString().split('T')[0]
      } else if (typeof holiday.date === 'string') {
        dateStr = holiday.date
      } else {
        return // Skip if can't parse
      }

      // Map date-holidays types to our schema
      // Most PH statutory holidays are regular holidays
      let type: 'regular_holiday' | 'special_non_working' | 'special_working' = 'regular_holiday'

      const holidayName = holiday.name || 'PH Holiday'

      // Identify special non-working days
      const isSpecialNonWorking = [
        'Additional Special',
        'Special Non-Working',
        'Special Public Holiday',
      ].some((keyword) => holidayName.includes(keyword))

      if (isSpecialNonWorking) {
        type = 'special_non_working'
      }

      holidays.push({
        date: dateStr,
        name: holidayName,
        type,
      })
    })
  } catch (error) {
    console.error('Error getting PH holidays:', error)
    throw new Error(`Failed to get PH holidays for ${year}: ${error instanceof Error ? error.message : String(error)}`)
  }

  return holidays.sort((a, b) => a.date.localeCompare(b.date))
}
