import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

/**
 * EditQuestion.jsx
 *
 * Usage: place in pages/QuestionBank/ and route to /questions/:id/edit (or similar)
 *
 * Features:
 * - Loads question by id
 * - Edit title/body, dynamic options, correct answer, difficulty, tags
 * - Optional image upload
 * - Submits PUT to /api/questions/:id (multipart if image present)
 *
 * Adjust API endpoints and field names to match your backend.
 */

const defaultOption = (text = "") => ({ id: Math.random().toString(36).slice(2), text });

export default function EditQuestion() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [options, setOptions] = useState([defaultOption(), defaultOption()]);
    const [correctOptionId, setCorrectOptionId] = useState(null);
    const [difficulty, setDifficulty] = useState("medium"); // easy, medium, hard
    const [tags, setTags] = useState(""); // comma separated
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

    useEffect(() => {
        let mounted = true;
        async function fetchQuestion() {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`/api/questions/${id}`);
                if (!mounted) return;
                const q = res.data;
                setTitle(q.title || "");
                setBody(q.body || "");
                if (Array.isArray(q.options) && q.options.length) {
                    setOptions(q.options.map((o) => ({ id: o.id ?? defaultOption().id, text: o.text ?? "" })));
                } else {
                    setOptions([defaultOption(), defaultOption()]);
                }
                setCorrectOptionId(q.correct_option_id ?? null);
                setDifficulty(q.difficulty ?? "medium");
                setTags(Array.isArray(q.tags) ? q.tags.join(", ") : q.tags ?? "");
                if (q.image_url) setImagePreviewUrl(q.image_url);
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Failed to load question");
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchQuestion();
        return () => {
            mounted = false;
        };
    }, [id]);

    function updateOptionText(optionId, newText) {
        setOptions((prev) => prev.map((o) => (o.id === optionId ? { ...o, text: newText } : o)));
    }

    function addOption() {
        setOptions((prev) => [...prev, defaultOption()]);
    }

    function removeOption(optionId) {
        setOptions((prev) => {
            const next = prev.filter((o) => o.id !== optionId);
            if (next.length < 2) {
                // ensure at least two options
                return prev;
            }
            return next;
        });
        if (correctOptionId === optionId) {
            setCorrectOptionId(null);
        }
    }

    function validate() {
        if (!title.trim()) return "Title is required";
        if (!body.trim()) return "Question body is required";
        if (options.length < 2) return "At least two options are required";
        if (!options.some((o) => o.text.trim())) return "All options must have text";
        if (!correctOptionId) return "Please select the correct option";
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        setSaving(true);
        setError(null);

        try {
            // Decide whether to send multipart/form-data (if image) or JSON
            if (imageFile) {
                const fd = new FormData();
                fd.append("title", title);
                fd.append("body", body);
                fd.append("difficulty", difficulty);
                fd.append("tags", tags);
                fd.append("correct_option_id", correctOptionId);
                fd.append("image", imageFile);
                fd.append("options", JSON.stringify(options.map((o) => ({ id: o.id, text: o.text }))));
                await axios.post(`/api/questions/${id}?_method=PUT`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                await axios.put(`/api/questions/${id}`, {
                    title,
                    body,
                    difficulty,
                    tags,
                    correct_option_id: correctOptionId,
                    options: options.map((o) => ({ id: o.id, text: o.text })),
                });
            }
            // Navigate back to question list or detail page
            navigate(-1);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Save failed");
        } finally {
            setSaving(false);
        }
    }

    function handleFileChange(e) {
        const f = e.target.files?.[0] ?? null;
        setImageFile(f);
        if (f) {
            const url = URL.createObjectURL(f);
            setImagePreviewUrl(url);
        }
    }

    if (loading) {
        return <div>Loading question...</div>;
    }

    return (
        <div className="edit-question-page" style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
            <h2>Edit Question</h2>
            {error && (
                <div style={{ background: "#ffe6e6", color: "#a00", padding: 8, marginBottom: 12, borderRadius: 4 }}>
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", marginBottom: 6 }}>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: "100%", padding: 8 }}
                        placeholder="Short title / summary"
                    />
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", marginBottom: 6 }}>Question</label>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={6}
                        style={{ width: "100%", padding: 8 }}
                        placeholder="Detailed question text"
                    />
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", marginBottom: 6 }}>Options</label>
                    <div>
                        {options.map((opt, idx) => (
                            <div key={opt.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                                <input
                                    type="radio"
                                    name="correct"
                                    checked={correctOptionId === opt.id}
                                    onChange={() => setCorrectOptionId(opt.id)}
                                />
                                <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => updateOptionText(opt.id, e.target.value)}
                                    placeholder={`Option ${idx + 1}`}
                                    style={{ flex: 1, padding: 6 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeOption(opt.id)}
                                    style={{ padding: "6px 8px" }}
                                    title="Remove option"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <div>
                        <button type="button" onClick={addOption} style={{ marginTop: 6, padding: "6px 10px" }}>
                            Add Option
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: 6 }}>Difficulty</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ width: "100%", padding: 8 }}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div style={{ flex: 2 }}>
                        <label style={{ display: "block", marginBottom: 6 }}>Tags (comma separated)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="math, algebra, functions"
                            style={{ width: "100%", padding: 8 }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", marginBottom: 6 }}>Image (optional)</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    {imagePreviewUrl && (
                        <div style={{ marginTop: 8 }}>
                            <img src={imagePreviewUrl} alt="preview" style={{ maxWidth: 300, maxHeight: 200, objectFit: "contain" }} />
                        </div>
                    )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" disabled={saving} style={{ padding: "8px 12px" }}>
                        {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        style={{ padding: "8px 12px" }}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}