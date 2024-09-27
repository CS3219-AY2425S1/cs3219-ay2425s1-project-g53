
'use client'
import React, { useState, useEffect, FormEvent } from 'react';


interface Question {
  id: number;
  title: string;
  description: string;
  category: string;
  complexity: string;
}

interface FormData {
  title: string,
  description: string,
  category: string,
  complexity: string
}

export default function Page() {
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [complexities, setComplexities] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    complexity: ''
  });
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [waiting, setWaiting] = useState<boolean>(false);

  const toggleExpanded = (id: number) => {
    if (expandedQuestions.has(id)) {
      setExpandedQuestions(prev => new Set([...prev].filter(x => x != id)))
    } else {
      setExpandedQuestions(prev => new Set([...prev, id]))
    }
  }

  useEffect(() => {
    fetch("http://127.0.0.1:5000/questions/")
      .then(res => res.json())
      .then(data => { setQuestions(data) });
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/questions/complexities")
      .then(res => res.json())
      .then((data: string[]) => {
        setComplexities(data);
      })
  }, [])

  // Handle form submission to create a new question
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setWaiting(true);
    e.preventDefault();
    setError(null)
    const res = await fetch("http://127.0.0.1:5000/questions/", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setWaiting(false);
    if (!res.ok) {
      setError("Failed to add question");
      return;
    }
    const data = await res.json();
    setQuestions([...questions, data]);
    setFormData({ title: '', description: '', category: '', complexity: '' });
  };


  // Render form and questions
  return (
    <div className="container-fluid">
      <form className="row g-3 mt-3" onSubmit={e => handleSubmit(e)}>
        <div className="col-4">
          <input className="form-control" type="text" required placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>
        <div className="col-4">
          <input className="form-control" type="text" required placeholder="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
        </div>
        <div className="col-4">
          <select className="form-select" id="complexities" value={formData.complexity} onChange={(e) => setFormData({ ...formData, complexity: e.target.value })}>
            <option value="" disabled selected>Complexity</option>
            {complexities.map((s, i) => {
              return <option value={s}>{s}</option>
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
        </div>
      </form>
      <form className="row g-3 mt-2">
        <div className="col-6">
          <input type="file" className="form-control" id="fileInput" />
        </div>
        <div className="col">
          <button className="btn btn-primary" type="submit">Upload JSON</button>
        </div>
      </form>
      <div className="row mx-3 mt-5">
        <table className="table" style={{
          tableLayout:
            "fixed"
        }}>
          <thead>
            <tr>
              <th className="col-1" scope="col">ID</th>
              <th className="col-4" scope="col">Title</th>
              <th className="col-6" scope="col">Description</th>
              <th className="col-4" scope="col">Category</th>
              <th className="col-2" scope="col">Complexity</th>
              <th className="col-1" scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {questions.map(question => (
              <>
                <tr>
                  <th scope="row">{question.id}</th>
                  <td>{question.title}</td>
                  <td className="text-truncate">{question.description}</td>
                  <td>{question.category}</td>
                  <td>{question.complexity}</td>
                  <td><button className="btn" onClick={() => toggleExpanded(question.id)}><i className="bi-chevron-down"></i> </button></td>
                </tr>
                {expandedQuestions.has(question.id) && (
                  <tr>
                    <td className="p-3 text-wrap text-break" colSpan={3}>{question.description}</td>
                    <td className="p-3 text-wrap" colSpan={3}>{question.category}</td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>);
}
