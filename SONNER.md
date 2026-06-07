# Sonner Toast Notifications Setup

## Overview

Sonner is a modern toast notification library integrated into Modulus Web for user feedback.

**Setup location:** `src/app/layout.tsx`
```tsx
<Toaster position="top-right" richColors closeButton expand />
```

---

## Usage Patterns

### **Pattern 1: In Server Actions (Recommended)**

Server actions return toast instructions that trigger on the client.

**Server action:**
```typescript
// src/app/(dashboard)/hr/actions/employee-actions.ts
import { toasts, createActionResult } from '@/lib/toast-server'

export async function createEmployeeAction(formData: FormData) {
  try {
    const employee = await employeeService.create(...)
    return createActionResult(
      true,
      { id: employee.id },
      undefined,
      toasts.success('Employee created successfully!')
    )
  } catch (err) {
    return createActionResult(
      false,
      undefined,
      'Failed to create employee',
      toasts.error('Could not create employee', err.message)
    )
  }
}
```

**Client form component:**
```typescript
'use client'

import { useActionState } from 'react'
import { useActionToast } from '@/hooks/use-action-toast'
import { createEmployeeAction } from './actions/employee-actions'

export function EmployeeForm() {
  const handleToast = useActionToast()
  const [state, action] = useActionState(
    async (prev, formData) => {
      const result = await createEmployeeAction(formData)
      handleToast(result)
      return result
    },
    null
  )

  return (
    <form action={action}>
      {/* form fields */}
    </form>
  )
}
```

---

### **Pattern 2: Direct Toast in Client Components**

For immediate feedback that doesn't need server round-trip.

```typescript
'use client'

import { toast } from 'sonner'

export function MyComponent() {
  const handleCopy = () => {
    navigator.clipboard.writeText('...')
    toast.success('Copied to clipboard!')
  }

  return <button onClick={handleCopy}>Copy</button>
}
```

---

### **Pattern 3: Toast with Description**

```typescript
toasts.error('Failed to save', 'Please check your input and try again')

// Shows:
// ❌ Failed to save
//    Please check your input and try again
```

---

## Toast Types

| Type | Usage | Color |
|------|-------|-------|
| `success` | Create, update, delete completed | Green |
| `error` | Failed operations | Red |
| `info` | Information messages | Blue |
| `warning` | Cautions, deprecations | Amber |
| `loading` | In-progress operations | Gray |

---

## Examples

### **Employee Creation with Toast**

```typescript
// Server action
export async function createEmployeeAction(formData: FormData) {
  try {
    const employee = await service.create(parsed.data)
    return {
      success: true,
      data: employee,
      toast: { type: 'success', message: 'Employee created!' }
    }
  } catch (err) {
    return {
      success: false,
      error: err.message,
      toast: { type: 'error', message: 'Failed to create employee' }
    }
  }
}
```

### **Leave Request Submission**

```typescript
const result = await submitLeaveAction(formData)
if (result?.toast) {
  toast[result.toast.type](result.toast.message)
}
if (result?.success) {
  // Close dialog, refresh list, etc.
}
```

### **Direct Feedback**

```typescript
const handleApprove = async (id: string) => {
  const toastId = toast.loading('Approving...')
  try {
    await approvePayroll(id)
    toast.success('Payroll approved!', { id: toastId })
  } catch {
    toast.error('Failed to approve', { id: toastId })
  }
}
```

---

## Customization

### **Position**
```typescript
<Toaster position="top-right" />  // top-left, top-center, bottom-right, etc.
```

### **Auto-dismiss timing**
```typescript
toast.success('Done!', { duration: 3000 })  // 3 seconds
```

### **Custom action button**
```typescript
toast.info('New updates available', {
  action: {
    label: 'Refresh',
    onClick: () => window.location.reload()
  }
})
```

---

## Migration from Alert Components

Replace old Alert components with Sonner:

**Before:**
```tsx
{state?.error && (
  <Alert variant="destructive">
    <AlertDescription>{state.error}</AlertDescription>
  </Alert>
)}
```

**After:**
```tsx
if (state?.error) {
  toast.error(state.error)
}
// Or use server action pattern above
```

---

## References

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Toast Server Utilities](src/lib/toast-server.ts)
- [Use Action Toast Hook](src/hooks/use-action-toast.ts)
