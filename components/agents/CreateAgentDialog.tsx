"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea
} from '@/libs/design-system';
import { Button } from '@/libs/design-system'
import { Input } from '@/libs/design-system'

// TODO: Replace deprecated components: Textarea
// 
// TODO: Replace deprecated components: Textarea
// import { Textarea } from '@/components/ui/textarea'

// TODO: Replace deprecated components: Label
// 
// TODO: Replace deprecated components: Label
// import { Label } from '@/components/ui/label'
import { AgentInsertSchema, AgentCreateInput } from "@/src/types/agent"
import type { Agent } from "@/services/agent-service"
import { toast } from "sonner"
import { Bot } from "lucide-react"
import { useCreateAgentMutation } from "@/hooks/use-agents"

export function CreateAgentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (agent: Agent) => void
}) {
  // Local form schema keeps CSV fields as strings for inputs
  const FormSchema = z.object({
    name: z.string().min(2).max(60),
    description: z.string().max(500).optional().default(""),
    model: z.string().max(120).optional().default("gpt-4o-mini"),
    avatar_url: z.string().url().optional().nullable(),
    status: z.enum(["online", "offline", "busy"]).optional().default("online"),
    system_prompt: z.string().max(4000).optional().default(""),
    capabilitiesCsv: z.string().optional().default(""),
    mcpToolsCsv: z.string().optional().default(""),
  })

  // Use Zod input type to align with zodResolver's expected input when defaults are used
  type FormValues = z.input<typeof FormSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      model: "gpt-4o-mini",
      system_prompt: "",
      capabilitiesCsv: "",
      mcpToolsCsv: "",
      status: "online",
    },
  })

  const [submitting, setSubmitting] = useState(false)

  const mutation = useCreateAgentMutation()

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      const capabilities = (values.capabilitiesCsv || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      const mcp_tools = (values.mcpToolsCsv || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      const payload: AgentCreateInput = {
        name: values.name ?? "",
        description: values.description ?? "",
        model: values.model ?? "gpt-4o-mini",
        system_prompt: values.system_prompt ?? "",
        capabilities,
        mcp_tools,
        status: values.status ?? "online",
        avatar_url: null,
      }

      const created = await mutation.mutateAsync(payload)
      toast.success("Agent created")
      onOpenChange(false)
      reset()
      onCreated?.(created)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to create agent"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg bg-card text-card-foreground border border-border shadow-xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Create New Assistant
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="My Research Agent" {...register("name")} />
            {errors.name?.message && (
              <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="What this agent does" {...register("description")} />
          </div>

          <div>
            <Label htmlFor="model">Model</Label>
            <Input id="model" placeholder="gpt-4o-mini" {...register("model")} />
          </div>

          <div>
            <Label htmlFor="system_prompt">System Prompt</Label>
            <Textarea id="system_prompt" placeholder="Behavior instructions" {...register("system_prompt")} />
          </div>

          <div>
            <Label htmlFor="capabilitiesCsv">Capabilities (comma-separated)</Label>
            <Input id="capabilitiesCsv" placeholder="search, analysis" {...register("capabilitiesCsv")} />
          </div>

          <div>
            <Label htmlFor="mcpToolsCsv">MCP Tools (comma-separated)</Label>
            <Input id="mcpToolsCsv" placeholder="brave-search, memory" {...register("mcpToolsCsv")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
