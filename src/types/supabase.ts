export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor: string
          entity: string
          entity_id: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          reason: string | null
          tenant_id: string
          timestamp: string
        }
        Insert: {
          action: string
          actor: string
          entity: string
          entity_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          tenant_id: string
          timestamp?: string
        }
        Update: {
          action?: string
          actor?: string
          entity?: string
          entity_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          tenant_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      audit_logs_2026_06: {
        Row: {
          action: string
          actor: string
          entity: string
          entity_id: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          reason: string | null
          tenant_id: string
          timestamp: string
        }
        Insert: {
          action: string
          actor: string
          entity: string
          entity_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          tenant_id: string
          timestamp?: string
        }
        Update: {
          action?: string
          actor?: string
          entity?: string
          entity_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          tenant_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      audit_logs_2026_07: {
        Row: {
          action: string
          actor: string
          entity: string
          entity_id: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          reason: string | null
          tenant_id: string
          timestamp: string
        }
        Insert: {
          action: string
          actor: string
          entity: string
          entity_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          tenant_id: string
          timestamp?: string
        }
        Update: {
          action?: string
          actor?: string
          entity?: string
          entity_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          tenant_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      audit_logs_2026_08: {
        Row: {
          action: string
          actor: string
          entity: string
          entity_id: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          reason: string | null
          tenant_id: string
          timestamp: string
        }
        Insert: {
          action: string
          actor: string
          entity: string
          entity_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          tenant_id: string
          timestamp?: string
        }
        Update: {
          action?: string
          actor?: string
          entity?: string
          entity_id?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          tenant_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      bir_tables: {
        Row: {
          base_tax: number
          bracket_from: number
          bracket_to: number | null
          cadence: string
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          rate: number
        }
        Insert: {
          base_tax: number
          bracket_from: number
          bracket_to?: number | null
          cadence?: string
          created_at?: string
          effective_from: string
          effective_to?: string | null
          id?: string
          rate: number
        }
        Update: {
          base_tax?: number
          bracket_from?: number
          bracket_to?: number | null
          cadence?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          rate?: number
        }
        Relationships: []
      }
      company_holidays: {
        Row: {
          created_at: string
          date: string
          deleted_at: string | null
          id: string
          multiplier_override: number | null
          name: string
          recurring: boolean
          scope: string
          scope_location_ids: string[] | null
          source: string
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          deleted_at?: string | null
          id?: string
          multiplier_override?: number | null
          name: string
          recurring?: boolean
          scope?: string
          scope_location_ids?: string[] | null
          source?: string
          tenant_id: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          deleted_at?: string | null
          id?: string
          multiplier_override?: number | null
          name?: string
          recurring?: boolean
          scope?: string
          scope_location_ids?: string[] | null
          source?: string
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_holidays_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_rates: {
        Row: {
          compensation_type: string
          created_at: string
          effective_from: string
          effective_to: string | null
          employee_id: string
          id: string
          rate_centavos: number
          tenant_id: string
        }
        Insert: {
          compensation_type: string
          created_at?: string
          effective_from: string
          effective_to?: string | null
          employee_id: string
          id?: string
          rate_centavos: number
          tenant_id: string
        }
        Update: {
          compensation_type?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          id?: string
          rate_centavos?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_rates_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_rates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_shift_assignments: {
        Row: {
          created_at: string
          effective_from: string
          effective_to: string | null
          employee_id: string
          id: string
          shift_policy_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          effective_from: string
          effective_to?: string | null
          employee_id: string
          id?: string
          shift_policy_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          id?: string
          shift_policy_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_shift_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_shift_assignments_shift_policy_id_fkey"
            columns: ["shift_policy_id"]
            isOneToOne: false
            referencedRelation: "shift_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_shift_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_status_history: {
        Row: {
          actor: string
          created_at: string
          effective_date: string
          employee_id: string
          id: string
          reason: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          actor: string
          created_at?: string
          effective_date: string
          employee_id: string
          id?: string
          reason?: string | null
          status: string
          tenant_id: string
        }
        Update: {
          actor?: string
          created_at?: string
          effective_date?: string
          employee_id?: string
          id?: string
          reason?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_status_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_status_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          avatar_url: string | null
          compensation_type: string
          contact_number: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_number: string
          employment_type: string
          first_name: string
          hire_date: string
          id: string
          job_title_id: string | null
          last_name: string
          middle_name: string | null
          pagibig_number: string | null
          philhealth_number: string | null
          sil_exempt: boolean
          sss_number: string | null
          status: string
          suffix: string | null
          tenant_id: string
          tin: string | null
          updated_at: string
          work_location_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          compensation_type: string
          contact_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number: string
          employment_type: string
          first_name: string
          hire_date: string
          id?: string
          job_title_id?: string | null
          last_name: string
          middle_name?: string | null
          pagibig_number?: string | null
          philhealth_number?: string | null
          sil_exempt?: boolean
          sss_number?: string | null
          status?: string
          suffix?: string | null
          tenant_id: string
          tin?: string | null
          updated_at?: string
          work_location_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          compensation_type?: string
          contact_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number?: string
          employment_type?: string
          first_name?: string
          hire_date?: string
          id?: string
          job_title_id?: string | null
          last_name?: string
          middle_name?: string | null
          pagibig_number?: string | null
          philhealth_number?: string | null
          sil_exempt?: boolean
          sss_number?: string | null
          status?: string
          suffix?: string | null
          tenant_id?: string
          tin?: string | null
          updated_at?: string
          work_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_job_title_id_fkey"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_work_location_id_fkey"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "work_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_contracts: {
        Row: {
          contract_type: string
          created_at: string
          deleted_at: string | null
          effective_from: string
          effective_to: string | null
          employee_id: string
          id: string
          issued_at: string | null
          issued_by: string | null
          status: string
          storage_path: string | null
          tenant_id: string
          updated_at: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          contract_type: string
          created_at?: string
          deleted_at?: string | null
          effective_from: string
          effective_to?: string | null
          employee_id: string
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          status?: string
          storage_path?: string | null
          tenant_id: string
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          contract_type?: string
          created_at?: string
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          status?: string
          storage_path?: string | null
          tenant_id?: string
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employment_contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employment_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_correction_requests: {
        Row: {
          id: string
          tenant_id: string
          employee_id: string
          timekeeping_record_id: string | null
          correction_type: string
          proposed_value: string
          reason: string
          status: string
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          employee_id: string
          timekeeping_record_id?: string | null
          correction_type: string
          proposed_value: string
          reason: string
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          employee_id?: string
          timekeeping_record_id?: string | null
          correction_type?: string
          proposed_value?: string
          reason?: string
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_correction_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_correction_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_correction_requests_timekeeping_record_id_fkey"
            columns: ["timekeeping_record_id"]
            isOneToOne: false
            referencedRelation: "timekeeping_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_correction_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_titles: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_titles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_ledger: {
        Row: {
          created_at: string
          days: number
          employee_id: string
          entry_type: string
          id: string
          leave_type: string
          notes: string | null
          reference_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          days: number
          employee_id: string
          entry_type: string
          id?: string
          leave_type: string
          notes?: string | null
          reference_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          days?: number
          employee_id?: string
          entry_type?: string
          id?: string
          leave_type?: string
          notes?: string | null
          reference_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_ledger_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_ledger_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_policies: {
        Row: {
          accrual_method: string
          annual_days: number
          carryover_cap_days: number | null
          carryover_policy: string
          cash_conversion: boolean
          created_at: string
          eligibility_months: number
          id: string
          leave_type: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          accrual_method?: string
          annual_days?: number
          carryover_cap_days?: number | null
          carryover_policy?: string
          cash_conversion?: boolean
          created_at?: string
          eligibility_months?: number
          id?: string
          leave_type: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          accrual_method?: string
          annual_days?: number
          carryover_cap_days?: number | null
          carryover_policy?: string
          cash_conversion?: boolean
          created_at?: string
          eligibility_months?: number
          id?: string
          leave_type?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_policies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          created_at: string
          days: number
          deleted_at: string | null
          document_path: string | null
          employee_id: string
          end_date: string
          id: string
          is_half_day: boolean
          leave_type: string
          reason: string
          rejection_reason: string | null
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days: number
          deleted_at?: string | null
          document_path?: string | null
          employee_id: string
          end_date: string
          id?: string
          is_half_day?: boolean
          leave_type: string
          reason: string
          rejection_reason?: string | null
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days?: number
          deleted_at?: string | null
          document_path?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          is_half_day?: boolean
          leave_type?: string
          reason?: string
          rejection_reason?: string | null
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          payload: Json | null
          read_at: string | null
          tenant_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          payload?: Json | null
          read_at?: string | null
          tenant_id: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          payload?: Json | null
          read_at?: string | null
          tenant_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      overtime_requests: {
        Row: {
          created_at: string
          deleted_at: string | null
          employee_id: string
          estimated_cost_centavos: number | null
          id: string
          multiplier: number
          ot_date: string
          ot_hours: number
          ot_type: string
          reason_category: string
          reason_detail: string | null
          rejection_reason: string | null
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          tenant_id: string
          timekeeping_record_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          employee_id: string
          estimated_cost_centavos?: number | null
          id?: string
          multiplier: number
          ot_date: string
          ot_hours: number
          ot_type: string
          reason_category: string
          reason_detail?: string | null
          rejection_reason?: string | null
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tenant_id: string
          timekeeping_record_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          employee_id?: string
          estimated_cost_centavos?: number | null
          id?: string
          multiplier?: number
          ot_date?: string
          ot_hours?: number
          ot_type?: string
          reason_category?: string
          reason_detail?: string | null
          rejection_reason?: string | null
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tenant_id?: string
          timekeeping_record_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "overtime_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_requests_timekeeping_record_id_fkey"
            columns: ["timekeeping_record_id"]
            isOneToOne: false
            referencedRelation: "timekeeping_records"
            referencedColumns: ["id"]
          },
        ]
      }
      pagibig_tables: {
        Row: {
          created_at: string
          effective_from: string
          effective_to: string | null
          employee_rate: number
          employer_rate: number
          id: string
          max_salary: number
          min_salary: number
        }
        Insert: {
          created_at?: string
          effective_from: string
          effective_to?: string | null
          employee_rate: number
          employer_rate: number
          id?: string
          max_salary: number
          min_salary: number
        }
        Update: {
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          employee_rate?: number
          employer_rate?: number
          id?: string
          max_salary?: number
          min_salary?: number
        }
        Relationships: []
      }
      payroll_items: {
        Row: {
          allowances_centavos: number
          basic_pay_centavos: number
          created_at: string
          employee_id: string
          gross_pay_centavos: number
          holiday_pay_centavos: number
          id: string
          late_deduction_centavos: number
          leave_pay_centavos: number
          line_items: Json | null
          net_pay_centavos: number
          night_diff_centavos: number
          ot_pay_centavos: number
          other_deductions_centavos: number
          pagibig_ee_centavos: number
          pagibig_er_centavos: number
          payroll_run_id: string
          philhealth_ee_centavos: number
          philhealth_er_centavos: number
          sss_ee_centavos: number
          sss_er_centavos: number
          tenant_id: string
          total_deductions_centavos: number
          updated_at: string
          wht_centavos: number
        }
        Insert: {
          allowances_centavos?: number
          basic_pay_centavos?: number
          created_at?: string
          employee_id: string
          gross_pay_centavos?: number
          holiday_pay_centavos?: number
          id?: string
          late_deduction_centavos?: number
          leave_pay_centavos?: number
          line_items?: Json | null
          net_pay_centavos?: number
          night_diff_centavos?: number
          ot_pay_centavos?: number
          other_deductions_centavos?: number
          pagibig_ee_centavos?: number
          pagibig_er_centavos?: number
          payroll_run_id: string
          philhealth_ee_centavos?: number
          philhealth_er_centavos?: number
          sss_ee_centavos?: number
          sss_er_centavos?: number
          tenant_id: string
          total_deductions_centavos?: number
          updated_at?: string
          wht_centavos?: number
        }
        Update: {
          allowances_centavos?: number
          basic_pay_centavos?: number
          created_at?: string
          employee_id?: string
          gross_pay_centavos?: number
          holiday_pay_centavos?: number
          id?: string
          late_deduction_centavos?: number
          leave_pay_centavos?: number
          line_items?: Json | null
          net_pay_centavos?: number
          night_diff_centavos?: number
          ot_pay_centavos?: number
          other_deductions_centavos?: number
          pagibig_ee_centavos?: number
          pagibig_er_centavos?: number
          payroll_run_id?: string
          philhealth_ee_centavos?: number
          philhealth_er_centavos?: number
          sss_ee_centavos?: number
          sss_er_centavos?: number
          tenant_id?: string
          total_deductions_centavos?: number
          updated_at?: string
          wht_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_items_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_periods: {
        Row: {
          cadence: string
          created_at: string
          end_date: string
          id: string
          payday: string
          period_code: string
          start_date: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cadence: string
          created_at?: string
          end_date: string
          id?: string
          payday: string
          period_code: string
          start_date: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cadence?: string
          created_at?: string
          end_date?: string
          id?: string
          payday?: string
          period_code?: string
          start_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_periods_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          created_at: string
          employee_count: number
          finalized_at: string | null
          finalized_by: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          payroll_period_id: string
          reopen_count: number
          status: string
          tenant_id: string
          total_employer_centavos: number
          total_gross_centavos: number
          total_net_centavos: number
          updated_at: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          created_at?: string
          employee_count?: number
          finalized_at?: string | null
          finalized_by?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          payroll_period_id: string
          reopen_count?: number
          status?: string
          tenant_id: string
          total_employer_centavos?: number
          total_gross_centavos?: number
          total_net_centavos?: number
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          created_at?: string
          employee_count?: number
          finalized_at?: string | null
          finalized_by?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          payroll_period_id?: string
          reopen_count?: number
          status?: string
          tenant_id?: string
          total_employer_centavos?: number
          total_gross_centavos?: number
          total_net_centavos?: number
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_payroll_period_id_fkey"
            columns: ["payroll_period_id"]
            isOneToOne: false
            referencedRelation: "payroll_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payslips: {
        Row: {
          created_at: string
          employee_id: string
          generated_at: string | null
          id: string
          payroll_item_id: string
          payroll_run_id: string
          status: string
          storage_path: string | null
          tenant_id: string
          void_reason: string | null
          voided_at: string | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          generated_at?: string | null
          id?: string
          payroll_item_id: string
          payroll_run_id: string
          status?: string
          storage_path?: string | null
          tenant_id: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          generated_at?: string | null
          id?: string
          payroll_item_id?: string
          payroll_run_id?: string
          status?: string
          storage_path?: string | null
          tenant_id?: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_payroll_item_id_fkey"
            columns: ["payroll_item_id"]
            isOneToOne: false
            referencedRelation: "payroll_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      philhealth_tables: {
        Row: {
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          max_premium: number
          max_salary: number
          min_premium: number
          min_salary: number
          rate: number
        }
        Insert: {
          created_at?: string
          effective_from: string
          effective_to?: string | null
          id?: string
          max_premium: number
          max_salary: number
          min_premium: number
          min_salary: number
          rate: number
        }
        Update: {
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          max_premium?: number
          max_salary?: number
          min_premium?: number
          min_salary?: number
          rate?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shift_policies: {
        Row: {
          created_at: string
          deleted_at: string | null
          grace_period_min: number
          id: string
          name: string
          night_diff_enabled: boolean
          night_diff_end: string
          night_diff_start: string
          ot_threshold_min: number
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          grace_period_min?: number
          id?: string
          name: string
          night_diff_enabled?: boolean
          night_diff_end?: string
          night_diff_start?: string
          ot_threshold_min?: number
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          grace_period_min?: number
          id?: string
          name?: string
          night_diff_enabled?: boolean
          night_diff_end?: string
          night_diff_start?: string
          ot_threshold_min?: number
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_policies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_policy_days: {
        Row: {
          break_minutes: number
          break_paid: boolean
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_rest_day: boolean
          shift_policy_id: string
          start_time: string
        }
        Insert: {
          break_minutes?: number
          break_paid?: boolean
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_rest_day?: boolean
          shift_policy_id: string
          start_time: string
        }
        Update: {
          break_minutes?: number
          break_paid?: boolean
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_rest_day?: boolean
          shift_policy_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_policy_days_shift_policy_id_fkey"
            columns: ["shift_policy_id"]
            isOneToOne: false
            referencedRelation: "shift_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      sss_tables: {
        Row: {
          created_at: string
          effective_from: string
          effective_to: string | null
          employee_share: number
          employer_share: number
          id: string
          max_salary: number
          min_salary: number
        }
        Insert: {
          created_at?: string
          effective_from: string
          effective_to?: string | null
          employee_share: number
          employer_share: number
          id?: string
          max_salary: number
          min_salary: number
        }
        Update: {
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          employee_share?: number
          employer_share?: number
          id?: string
          max_salary?: number
          min_salary?: number
        }
        Relationships: []
      }
      tenant_memberships: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_modules: {
        Row: {
          enabled_at: string
          module: string
          tenant_id: string
        }
        Insert: {
          enabled_at?: string
          module: string
          tenant_id: string
        }
        Update: {
          enabled_at?: string
          module?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_modules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          authorized_signatory_name: string | null
          authorized_signatory_position: string | null
          created_at: string
          deleted_at: string | null
          id: string
          locale: string
          location_label: string
          logo_url: string | null
          name: string
          payroll_cadence: string
          sil_exempt: boolean
          slug: string
          timezone: string
          tin: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          authorized_signatory_name?: string | null
          authorized_signatory_position?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          locale?: string
          location_label?: string
          logo_url?: string | null
          name: string
          payroll_cadence?: string
          sil_exempt?: boolean
          slug: string
          timezone?: string
          tin?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          authorized_signatory_name?: string | null
          authorized_signatory_position?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          locale?: string
          location_label?: string
          logo_url?: string | null
          name?: string
          payroll_cadence?: string
          sil_exempt?: boolean
          slug?: string
          timezone?: string
          tin?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      timekeeping_corrections: {
        Row: {
          corrected_clock_in: string | null
          corrected_clock_out: string | null
          created_at: string
          deleted_at: string | null
          employee_id: string
          id: string
          reason_category: string
          reason_detail: string | null
          rejection_reason: string | null
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          tenant_id: string
          timekeeping_record_id: string
          updated_at: string
        }
        Insert: {
          corrected_clock_in?: string | null
          corrected_clock_out?: string | null
          created_at?: string
          deleted_at?: string | null
          employee_id: string
          id?: string
          reason_category: string
          reason_detail?: string | null
          rejection_reason?: string | null
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tenant_id: string
          timekeeping_record_id: string
          updated_at?: string
        }
        Update: {
          corrected_clock_in?: string | null
          corrected_clock_out?: string | null
          created_at?: string
          deleted_at?: string | null
          employee_id?: string
          id?: string
          reason_category?: string
          reason_detail?: string | null
          rejection_reason?: string | null
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tenant_id?: string
          timekeeping_record_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timekeeping_corrections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timekeeping_corrections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timekeeping_corrections_timekeeping_record_id_fkey"
            columns: ["timekeeping_record_id"]
            isOneToOne: false
            referencedRelation: "timekeeping_records"
            referencedColumns: ["id"]
          },
        ]
      }
      timekeeping_records: {
        Row: {
          auto_flagged: boolean
          clock_in: string | null
          clock_out: string | null
          created_at: string
          date: string
          employee_id: string
          flag_reason: string | null
          id: string
          is_manual_entry: boolean
          late_minutes: number
          manual_entry_by: string | null
          night_diff_minutes: number
          ot_minutes: number
          status: string
          tenant_id: string
          undertime_minutes: number
          updated_at: string
          worked_minutes: number | null
        }
        Insert: {
          auto_flagged?: boolean
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date: string
          employee_id: string
          flag_reason?: string | null
          id?: string
          is_manual_entry?: boolean
          late_minutes?: number
          manual_entry_by?: string | null
          night_diff_minutes?: number
          ot_minutes?: number
          status?: string
          tenant_id: string
          undertime_minutes?: number
          updated_at?: string
          worked_minutes?: number | null
        }
        Update: {
          auto_flagged?: boolean
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          flag_reason?: string | null
          id?: string
          is_manual_entry?: boolean
          late_minutes?: number
          manual_entry_by?: string | null
          night_diff_minutes?: number
          ot_minutes?: number
          status?: string
          tenant_id?: string
          undertime_minutes?: number
          updated_at?: string
          worked_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "timekeeping_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timekeeping_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      work_locations: {
        Row: {
          address: string | null
          code: string | null
          created_at: string
          deleted_at: string | null
          id: string
          manager_user_id: string | null
          name: string
          status: string
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          manager_user_id?: string | null
          name: string
          status?: string
          tenant_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          manager_user_id?: string | null
          name?: string
          status?: string
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role_in_tenant: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      get_user_tenant_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      user_role:
        | "owner"
        | "hr_admin"
        | "manager"
        | "employee"
        | "branch_manager"
        | "accountant"
        | "staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: [
        "owner",
        "hr_admin",
        "manager",
        "employee",
        "branch_manager",
        "accountant",
        "staff",
      ],
    },
  },
} as const
A new version of Supabase CLI is available: v2.105.0 (currently installed v2.75.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
