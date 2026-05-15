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
  shareToken: generateShareToken(),
  submitMessage: 'Thank you for your response!',
})

const defaultLabelFor = (type) =>
  ({
    text: 'Short Answer',
    textarea: 'Long Answer',
    multiple: 'Multiple Choice',
    checkbox: 'Checkboxes',
    scale: 'Rating Scale',
    dropdown: 'Dropdown',
    email: 'Email Address',
    date: 'Date',
    heading: 'Section Heading',
  })[type] ?? 'Field'

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
      addField: (formId, fieldType) => {
        const newField = {
          id: generateId(),
          type: fieldType,
          label: defaultLabelFor(fieldType),
          placeholder: '',
          options: ['multiple', 'checkbox', 'dropdown'].includes(fieldType)
            ? ['Option 1', 'Option 2']
            : [],
          required: false,
          order: 0,
          scaleMin: fieldType === 'scale' ? 1 : undefined,
          scaleMax: fieldType === 'scale' ? 5 : undefined,
        }

        set((state) => {
          const form = state.forms.find((item) => item.id === formId)

          if (!form) return state

          return {
            forms: state.forms.map((item) =>
              item.id === formId
                ? {
                    ...item,
                    fields: [
                      ...item.fields,
                      { ...newField, order: item.fields.length },
                    ],
                  }
                : item,
            ),
          }
        })

        return newField.id
      },
      updateField: (formId, fieldId, patch) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? {
                  ...form,
                  fields: form.fields.map((field) =>
                    field.id === fieldId ? { ...field, ...patch } : field,
                  ),
                }
              : form,
          ),
        }))
      },
      removeField: (formId, fieldId) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? {
                  ...form,
                  fields: form.fields
                    .filter((field) => field.id !== fieldId)
                    .map((field, index) => ({ ...field, order: index })),
                }
              : form,
          ),
        }))
      },
      reorderFields: (formId, reorderedFields) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? {
                  ...form,
                  fields: reorderedFields.map((field, index) => ({
                    ...field,
                    order: index,
                  })),
                }
              : form,
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
