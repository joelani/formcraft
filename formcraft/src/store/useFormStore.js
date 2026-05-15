import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId, generateShareToken } from '../lib/idgen.js'

const createNewForm = (title) => ({
  id: generateId(),
  title,
  description: '',
  fields: [],
  status: 'draft',
  createdAt: new Date().toISOString(),
  shareToken: '',
  submitMessage: 'Thank you for your response!',
})

export const useFormStore = create(
  persist(
    (set, get) => ({
      forms: [],
      createForm: (title) => {
        const form = createNewForm(title)
        set((state) => ({ forms: [...state.forms, form] }))
        return form.id
      },
      updateForm: (id, patch) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === id ? { ...form, ...patch } : form,
          ),
        }))
      },
      deleteForm: (id) => {
        set((state) => ({
          forms: state.forms.filter((form) => form.id !== id),
        }))
      },
      publishForm: (id) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === id
              ? {
                  ...form,
                  status: 'published',
                  shareToken: form.shareToken || generateShareToken(),
                }
              : form,
          ),
        }))
      },
      saveDraft: (id) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === id ? { ...form, status: 'draft' } : form,
          ),
        }))
      },
      getForm: (id) => get().forms.find((form) => form.id === id),
    }),
    {
      name: 'formcraft-forms',
    },
  ),
)
