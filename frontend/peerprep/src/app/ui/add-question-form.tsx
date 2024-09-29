
import React, { FormEvent, useState } from 'react'
import Question from '../lib/question'
import useSWR from 'swr'
import { AppProps } from 'next/app'


enum Complexity {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard"
}

interface FormData {
  title: string,
  description: string,
  categories: Category[],
  complexity: Complexity | null
}

interface Category {
  name: string
}

function useCategories() {
  const { data, error, isLoading } = useSWR<Category[], undefined, string>("/api/categories", key => fetch(key).then(res => res.json()));

  return {
    categories: data,
    categoriesLoading: isLoading,
    categoriesError: error
  }
}

function useComplexities() {
  const { data, error, isLoading } = useSWR<Complexity[], undefined, string>("/api/complexities", key => fetch(key).then(res => res.json()));

  return {
    complexities: data,
    complexitiesLoading: isLoading,
    complexitiesError: error
  }
}

export default function AddQuestionForm(props: { className: string, onQuestionCreated: (question: Question) => void }) {
  const [formData, setFormData] = useState<FormData>({ title: "", description: "", categories: [], complexity: null });
  const [formError, setFormError] = useState<string>("");
  const { categories, categoriesLoading, categoriesError } = useCategories();
  const { complexities, complexitiesLoading, complexitiesError } = useComplexities();
  const [waiting, setWaiting] = useState<boolean>(false);


  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.categories.length === 0) {
      setFormError("Select at least 1 category");
      return false;
    }
    if (!formData.complexity) {
      setFormError("Select form complexity");
      return false;
    }
    setWaiting(true);
    fetch("/api/questions/create", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    }).then(response => response.json())
      .then(o => props.onQuestionCreated(o));
    setWaiting(false);
    setFormData({ title: "", description: "", categories: [], complexity: null });
    return false;
  }


  return (
    <form className={`row g-3 ${props.className}`} onSubmit={handleSubmit}>
      <div className="col-4">
        <input className="form-control" type="text" required placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
      </div>
      <label htmlFor='category-select' className="form-label col-1">Categories: </label>
      <div className="col-3">
        <select className="form-select" id="category-select" multiple onChange={(e) => {
          const options = e.target.selectedOptions;
          let newOptions = [];
          for (let i = 0; i < options.length; ++i) {
            newOptions.push(options[i].value);
          }
          setFormData(prev => { return { ...prev, categories: newOptions.map(n => { return { name: n } }) } });
          console.log(newOptions);
        }}>
          {categories && categories.map(c => c.name).map(n => (<option key={n} value={n}>{n}</option>))}
        </select>
      </div>
      <div className="col-4">
        <select className="form-select" id="complexities" value={formData.complexity ? formData.complexity.toString() : ""} onChange={(e) => setFormData({ ...formData, complexity: e.target.value as Complexity })}>
          <option value="" disabled>Complexity</option>
          {complexities && complexities.map((s, i) => {
            return <option key={s} value={s}>{s}</option>
          })}
        </select>
      </div>
      <div className="col-12">
        <textarea className="form-control" rows={6} placeholder="Description" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      </div>
      <div className="col-12">
        {waiting
          ?
          <button className="btn btn-primary" type="button" disabled>
            <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span role="status">Loading...</span>
          </button>
          :
          <button className="btn btn-primary" type="submit">Add Question</button>
        }
        <label className="text-danger ms-4">{formError}</label>
      </div>
    </form>
  )
}  
