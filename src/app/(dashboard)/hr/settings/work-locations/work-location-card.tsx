'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { WorkLocationFormDialog } from './work-location-form-dialog'
import { deactivateWorkLocationAction } from './actions/work-location-actions'
import type { Database } from '@/types/supabase'

type WorkLocationRow = Database['public']['Tables']['work_locations']['Row']

const TYPE_LABELS: Record<string, string> = {
  head_office:  'Head Office',
  branch:       'Branch',
  store:        'Store',
  office:       'Office',
  project_site: 'Project Site',
  warehouse:    'Warehouse',
  field:        'Field',
  mobile:       'Mobile',
}

export function WorkLocationCard({ location }: { location: WorkLocationRow }) {
  return (
    <Card className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faBuilding} className="text-primary fa-lg" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-foreground truncate">
                {location.name}
              </p>
              {location.code && (
                <p className="text-xs text-muted-foreground">{location.code}</p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <FontAwesomeIcon icon={faEllipsis} className="fa-sm" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <WorkLocationFormDialog mode="edit" location={location} asMenuItem />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deactivateWorkLocationAction(location.id)}
              >
                Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {TYPE_LABELS[location.type] ?? location.type}
          </Badge>
          {location.status === 'inactive' && (
            <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
              Inactive
            </Badge>
          )}
        </div>

        {location.address && (
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {location.address}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
