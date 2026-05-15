import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSubmissionStore = create(
  persist(
    (set, get) => ({
      submissions: [],
      invites: [],
      addSubmission: (submission) => {
        set((state) => ({
          submissions: [...state.submissions, submission],
        }))
      },
      getSubmissionsByForm: (formId) =>
        get().submissions.filter((submission) => submission.formId === formId),
      addInvite: (invite) => {
        set((state) => ({
          invites: [...state.invites, invite],
        }))
      },
      getInvitesByForm: (formId) =>
        get().invites.filter((invite) => invite.formId === formId),
      markInviteOpened: (inviteId) => {
        set((state) => ({
          invites: state.invites.map((invite) =>
            invite.id === inviteId
              ? { ...invite, openedAt: new Date().toISOString() }
              : invite,
          ),
        }))
      },
      markInviteSubmitted: (inviteId) => {
        set((state) => ({
          invites: state.invites.map((invite) =>
            invite.id === inviteId
              ? { ...invite, submittedAt: new Date().toISOString() }
              : invite,
          ),
        }))
      },
    }),
    {
      name: 'formcraft-submissions',
    },
  ),
)
