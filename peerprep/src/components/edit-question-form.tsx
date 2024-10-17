import React, { useState } from 'react';
import useSWR from 'swr'
import { Question } from '@/actions/questions';

interface EditQuestionFormProps {
  question: Question;
  onUpdate: (q: Question) => void;
  onCancel: () => void;
  onDelete: (id: number) => void;
}

enum Complexity {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard"
}

function useComplexities() {
  const { data, error, isLoading } = useSWR<Complexity[], undefined, string>("/api/complexities", key => fetch(key).then(res => res.json()));

  return {
    complexities: data,
    complexitiesLoading: isLoading,
    complexitiesError: error
  }
}

const EditQuestionForm: React.FC<EditQuestionFormProps> = ({ question, onUpdate, onCancel, onDelete }) => {
  const [updatedQuestion, setUpdatedQuestion] = useState<Question>(question);
  const { complexities, complexitiesLoading, complexitiesError } = useComplexities();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdatedQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpdatedQuestion(prev => ({ ...prev, complexity: e.target.value as Complexity }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(updatedQuestion);
  };

  const handleDelete = () => {
    onDelete(updatedQuestion.id);
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3 mt-3">
      <div className="col-4">
        <input
          type="text"
          name="title"
          value={updatedQuestion.title}
          onChange={handleChange}
          placeholder="Title"
          required
          className="form-control"
        />
      </div>
      <div className="col-4">
        <select className="form-select" id="complexities" value={updatedQuestion.complexity ? updatedQuestion.complexity.toString() : ""} onChange={handleSelectChange}>
          <option value="" disabled>Complexity</option>
          {complexities && complexities.map((s, i) => {
            return <option key={s} value={s}>{s}</option>
          })}
        </select>
      </div>
      <div className="d-flex justify-content-end col-4">
        <button type="submit" className="btn btn-warning me-2">Edit</button>
        <button type="button" className="btn btn-danger me-2" onClick={handleDelete}>Delete</button>
        <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>Cancel</button>
      </div>
      <div className="col-12">
        <textarea
          name="description"
          value={updatedQuestion.description}
          onChange={handleChange}
          placeholder="Description"
          required
          className="form-control"
          rows={6}
        />
      </div>
    </form>
  );
};

export default EditQuestionForm;
