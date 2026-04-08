export interface WorkflowStep {
  id?: number
  step_order: number
  user_id: number
  user_name: string
  secondary_user_id: number | null
  secondary_user_name: string | null
  start_date: string | null
  end_date: string | null
}

export interface Workflow {
  id: number | null
  name: string
  steps: WorkflowStep[]
  created_at?: string
  updated_at?: string
}