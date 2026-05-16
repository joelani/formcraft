import { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { useFormStore } from "../store/useFormStore.js";
import { useSubmissionStore } from "../store/useSubmissionStore.js";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function FormCard({ form, responseCount, onDelete }) {
  const navigate = useNavigate();
  const description = form.description?.trim();

  return (
    <article className="flex min-h-64 flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="mb-4">
        <Badge variant={form.status === "published" ? "published" : "draft"}>
          {form.status === "published" ? "Published" : "Draft"}
        </Badge>
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold text-text-primary">
          {form.title}
        </h2>
        {description ? (
          <p className="mt-2 line-clamp-2 text-sm text-text-muted">
            {description}
          </p>
        ) : (
          <p className="mt-2 text-sm italic text-text-muted">
            No description added
          </p>
        )}
      </div>

      <div className="text-xs text-text-muted">
        {responseCount} {responseCount === 1 ? "response" : "responses"}{" "}
        &middot; {formatDate(form.createdAt)}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Button
          variant="secondary"
          size="sm"
          className="min-w-0 flex-1"
          onClick={() => navigate(`/builder/${form.id}`)}
        >
          Open Builder
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="min-w-0 flex-1"
          onClick={() => navigate(`/analytics/${form.id}`)}
        >
          Analytics
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="px-2.5"
          onClick={() => onDelete(form)}
        >
          <span className="sr-only">Delete {form.title}</span>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const forms = useFormStore((state) => state.forms);
  const createForm = useFormStore((state) => state.createForm);
  const deleteForm = useFormStore((state) => state.deleteForm);
  const getSubmissionsByForm = useSubmissionStore(
    (state) => state.getSubmissionsByForm,
  );
  const navigate = useNavigate();

  const closeCreateModal = () => {
    setModalOpen(false);
    setTitle("");
  };

  const handleCreate = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    const id = createForm(trimmedTitle);
    closeCreateModal();
    navigate(`/builder/${id}`);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    deleteForm(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="mx-auto max-w-[var(--content-max-width)] p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">
          My Forms
        </h1>
        <Button
          variant="primary"
          className="w-full sm:w-auto"
          onClick={() => setModalOpen(true)}
        >
          + New Form
        </Button>
      </header>

      <main>
        {forms.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No forms yet"
            description="Create your first form to start collecting responses."
            action={
              <Button variant="primary" onClick={() => setModalOpen(true)}>
                + New Form
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                responseCount={getSubmissionsByForm(form.id).length}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={modalOpen} onClose={closeCreateModal} title="Create form">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleCreate();
          }}
        >
          <Input
            label="Form title"
            placeholder="e.g. Customer Feedback Survey"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={closeCreateModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto"
              disabled={!title.trim()}
            >
              Create
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete form?"
      >
        <p className="text-sm leading-6 text-text-secondary">
          This will permanently delete "{deleteTarget?.title}" and all its
          responses. This cannot be undone.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="w-full bg-transparent sm:w-auto"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
