import { create } from 'zustand'
import { supabase, supabaseAnon } from '../lib/supabase.js'

try {
  globalThis.localStorage?.removeItem('formcraft-submissions')
} catch {
  // Ignore storage access errors in restricted browser contexts.
}

export const useSubmissionStore = create((set, get) => ({
  submissions: [],
  invites: [],
  loading: false,
  error: null,

  fetchSubmissions: async (formId) => {
    set({ loading: true, error: null })

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false })

    if (error) {
      set({ error: error.message, loading: false })
      return []
    }

    set({ submissions: data ?? [], loading: false })
    return data ?? []
  },

  addSubmission: async (submission) => {
    const { data, error } = await supabaseAnon
      .from('submissions')
      .insert({
        form_id: submission.formId,
        responses: submission.responses,
        submitted_at: submission.submittedAt,
        duration: submission.duration,
        device: submission.device,
      })
      .select()
      .single()

    if (error) throw error

    set((state) => ({ submissions: [data, ...state.submissions] }))
    return data
  },

  getSubmissionsByForm: (formId) =>
    get().submissions.filter((submission) => submission.form_id === formId),

  fetchInvites: async (formId) => {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('form_id', formId)
      .order('sent_at', { ascending: false })

    if (error) return []

    set({ invites: data ?? [] })
    return data ?? []
  },

  addInvite: async (invite) => {
    const { data, error } = await supabase
      .from('invites')
      .insert({
        form_id: invite.formId,
        email: invite.email,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    set((state) => ({ invites: [data, ...state.invites] }))
    return data
  },

  getInvitesByForm: (formId) =>
    get().invites.filter((invite) => invite.form_id === formId),

  markInviteOpened: async (inviteId) => {
    const openedAt = new Date().toISOString()
    const { error } = await supabaseAnon
      .from('invites')
      .update({ opened_at: openedAt })
      .eq('id', inviteId)

    if (error) return

    set((state) => ({
      invites: state.invites.map((invite) =>
        invite.id === inviteId ? { ...invite, opened_at: openedAt } : invite,
      ),
    }))
  },

  markInviteSubmitted: async (inviteId) => {
    const submittedAt = new Date().toISOString()
    const { error } = await supabaseAnon
      .from('invites')
      .update({ submitted_at: submittedAt })
      .eq('id', inviteId)

    if (error) return

    set((state) => ({
      invites: state.invites.map((invite) =>
        invite.id === inviteId
          ? { ...invite, submitted_at: submittedAt }
          : invite,
      ),
    }))
  },
}))
