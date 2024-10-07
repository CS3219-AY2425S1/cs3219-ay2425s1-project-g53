
'use client'
import React, { useState } from 'react';
import useSWR from 'swr'
import AddQuestionForm from '../ui/add-question-form';
import EditQuestionForm from '../ui/edit-question-form';


interface Question {
  id: number;
  title: string;
  description: string;
  categories: [{ id: number, name: string }];
  complexity: string;
}


export default function Page() {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const toggleExpanded = (id: number) => {
    if (expandedQuestions.has(id)) {
      setExpandedQuestions(prev => new Set([...prev].filter(x => x != id)))
    } else {
      setExpandedQuestions(prev => new Set([...prev, id]))
    }
  }
  
  const { data, error, isLoading, mutate } = useSWR<Question[], any, string>('/api/questions', key => fetch(key).then(res => res.json()))

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this question?");
    if (confirmed) {
      await fetch(`/api/questions/id/${id}`, { method: 'DELETE' });
      mutate(prev => prev ? prev.filter(question => question.id !== id) : []);
    }
  };

  const handleUpdate = async (updatedQuestion: Question) => {
    await fetch(`/api/questions/${updatedQuestion.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedQuestion),
    });
    mutate(prev => prev ? prev.map(q => (q.id === updatedQuestion.id ? updatedQuestion : q)) : []);
    setEditingQuestion(null);
  };

  // Render form and questions
  return (
    <div className="container-fluid">
      <AddQuestionForm className="mt-5" onQuestionCreated={q => mutate(prev => prev ? [...prev, q] : [])}/>

      {(error || isLoading) && (
        <div className="col-12 mt-5 ps-3 fs-3 justify-content-center">
          {isLoading ? <p>Loading...</p> : <p className="text-danger">Questions not available</p>}
        </div>
      )}
      <div className="row mx-3 mt-5" >
        <div className="overflow-y-auto overflow-x-hidden" style={{ maxHeight: "90vh" }} >
          <table className="table table-striped mh-100" style={{
            tableLayout:
              "fixed",
          }}>
            <thead className="sticky-top">
              <tr>
                <th className="col-1" scope="col">ID</th>
                <th className="col-4" scope="col">Title</th>
                <th className="col-6" scope="col">Description</th>
                <th className="col-3" scope="col">Category</th>
                <th className="col-2" scope="col">Complexity</th>
                <th className="col-1" scope="col"></th>
              </tr>
            </thead>
            <tbody >
              {data && data.map((question, index) => (
                <React.Fragment key={question.id}>
                  <tr>
                    <th scope="row">{question.id}</th>
                    <td>{question.title}</td>
                    <td className="text-truncate">{question.description}</td>
                    <td>{question.categories.map(c => c.name).join(", ")}</td>
                    <td>{question.complexity}</td>
                    <td><button className="btn" onClick={() => toggleExpanded(question.id)}><i className="bi-chevron-down"></i> </button></td>
                  </tr>
                  {expandedQuestions.has(question.id) && (
                    <tr>
                      <td className="p-3 text-wrap" colSpan={12}>
                          <EditQuestionForm 
                            question={question} 
                            onUpdate={handleUpdate} 
                            onCancel={() => toggleExpanded(question.id)} 
                            onDelete={handleDelete}
                          />
                        </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
