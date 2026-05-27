import { create } from "zustand";
import { generateShareToken } from "../lib/idgen.js";
import { supabase, supabaseAnon } from "../lib/supabase.js";

const defaultLabelFor = (type) =>
  ({
    text: "Short Answer",
    textarea: "Long Answer",
    multiple: "Multiple Choice",
    checkbox: "Checkboxes",
    scale: "Rating Scale",
    dropdown: "Dropdown",
    email: "Email Address",
    date: "Date",
    heading: "Section Heading",
  })[type] ?? "Field";

const createFieldId = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : generateShareToken();

export const useFormStore = create((set, get) => ({
  forms: [],
  loading: false,
  error: null,

  fetchForms: async () => {
    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }

    set({ forms: data ?? [], loading: false });
  },

  fetchForm: async (idOrToken) => {
    // Check if it looks like a UUID
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrToken,
      );

    const query = isUUID
      ? `id.eq.${idOrToken},share_token.eq.${idOrToken}`
      : `share_token.eq.${idOrToken}`;

    // Try anon client first for public access
    const { data } = await supabaseAnon
      .from("forms")
      .select("*")
      .or(query)
      .eq("status", "published")
      .maybeSingle();

    if (data) return data;

    // Fall back to authenticated client for owner preview
    const { data: authData } = await supabase
      .from("forms")
      .select("*")
      .or(query)
      .maybeSingle();

    return authData ?? null;
  },

  createForm: async (title) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("forms")
      .insert({
        user_id: user.id,
        title,
        description: "",
        fields: [],
        status: "draft",
        share_token: null,
        submit_message: "Thank you for your response!",
      })
      .select()
      .single();

    if (error) throw error;

    set((state) => ({ forms: [data, ...state.forms] }));
    return data.id;
  },

  updateForm: async (id, patch) => {
    const { data, error } = await supabase
      .from("forms")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      forms: state.forms.map((form) => (form.id === id ? data : form)),
    }));

    return data;
  },

  deleteForm: async (id) => {
    const { error } = await supabase.from("forms").delete().eq("id", id);

    if (error) throw error;

    set((state) => ({
      forms: state.forms.filter((form) => form.id !== id),
    }));
  },

  publishForm: async (id) => {
    const form = get().forms.find((item) => item.id === id);
    const shareToken = form?.share_token || generateShareToken();

    return get().updateForm(id, {
      status: "published",
      share_token: shareToken,
    });
  },

  saveDraft: async (id) => {
    return get().updateForm(id, { status: "draft" });
  },

  addField: async (formId, fieldType) => {
    const form = get().forms.find((item) => item.id === formId);
    if (!form) return;
    const fields = form.fields ?? [];

    const newField = {
      id: createFieldId(),
      type: fieldType,
      label: defaultLabelFor(fieldType),
      placeholder: "",
      options: ["multiple", "checkbox", "dropdown"].includes(fieldType)
        ? ["Option 1", "Option 2"]
        : [],
      required: false,
      order: fields.length,
      scaleMin: fieldType === "scale" ? 1 : undefined,
      scaleMax: fieldType === "scale" ? 5 : undefined,
    };

    const updatedFields = [...fields, newField];
    await get().updateForm(formId, { fields: updatedFields });
    return newField.id;
  },

  updateField: async (formId, fieldId, patch) => {
    const form = get().forms.find((item) => item.id === formId);
    if (!form) return;

    const updatedFields = (form.fields ?? []).map((field) =>
      field.id === fieldId ? { ...field, ...patch } : field,
    );

    await get().updateForm(formId, { fields: updatedFields });
  },

  removeField: async (formId, fieldId) => {
    const form = get().forms.find((item) => item.id === formId);
    if (!form) return;

    const updatedFields = (form.fields ?? [])
      .filter((field) => field.id !== fieldId)
      .map((field, index) => ({ ...field, order: index }));

    await get().updateForm(formId, { fields: updatedFields });
  },

  reorderFields: async (formId, reorderedFields) => {
    const updatedFields = reorderedFields.map((field, index) => ({
      ...field,
      order: index,
    }));

    await get().updateForm(formId, { fields: updatedFields });
  },

  updateFieldLocal: (formId, fieldId, patch) => {
    set((state) => ({
      forms: state.forms.map((form) =>
        form.id === formId
          ? {
              ...form,
              fields: (form.fields ?? []).map((field) =>
                field.id === fieldId ? { ...field, ...patch } : field,
              ),
            }
          : form,
      ),
    }));
  },

  reorderFieldsLocal: (formId, reorderedFields) => {
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
    }));
  },
}));
