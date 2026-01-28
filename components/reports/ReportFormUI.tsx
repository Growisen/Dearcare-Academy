"use client";
import React, { useState, useEffect } from "react";
import { PerformanceRating, FivePointRating, AssessmentType, SubmissionStatus } from "@/types/report.types";

const performanceOptions: PerformanceRating[] = ["EXCELLENT", "GOOD", "AVERAGE"];
const fivePointOptions: FivePointRating[] = ["VERY_LOW", "LOW", "AVERAGE", "GOOD", "VERY_GOOD"];
const assessmentTypeOptions: AssessmentType[] = ["THEORY", "WEEKLY", "PRACTICAL", "PROJECT", "ASSIGNMENT"];
const submissionStatusOptions: SubmissionStatus[] = ["ON_TIME", "LATE"];

export default function ReportFormUI({ student, initialData, onSubmit, onCancel }: any) {
  // Section state
  const [tab, setTab] = useState(1);

  // Section 1: Performance
  const [performance, setPerformance] = useState(initialData?.performance || {
    home_care_assistant: null,
    delivery_care_assistant: null,
    old_age_home_rehab: null,
    hospital_care: null,
    senior_citizens_assistant: null,
    icu_home_care_assistant: null,
    critical_illness_care_assistant: null,
    companionship_assistant: null,
    clinical_assistant: null,
  });
  // Section 2: General Behavior
  const [general, setGeneral] = useState(initialData?.general || {
    study_time_attendance: "",
    complaints_while_studies: "",
    willing_to_cooperate: null,
    follows_instruction: null,
    shows_respect_for_authority: null,
    considerate_towards_others: null,
    mix_well_with_others: null,
  });
  // Section 3: Academic Behavior
  const [academic, setAcademic] = useState(initialData?.academic || {
    focused_on_studies: null,
    able_to_attend_independently: null,
    complies_with_study_regulations: null,
    willing_to_put_effort: null,
    able_to_manage_time_well: null,
  });
  // Section 4: Character & Lifestyle
  const [character, setCharacter] = useState(initialData?.character || {
    display_neatness: null,
    dress_appropriately: null,
    maintain_good_classmate_relation: null,
    shows_discipline_in_habits: null,
    show_care_for_others: null,
    adaptability_to_change: null,
    show_maturity: null,
    show_respectfulness: null,
    show_leadership_qualities: null,
  });
  // Section 5: Assessments
  const [assessmentMeta, setAssessmentMeta] = useState({
    duration: initialData?.report?.mark_assessment_duration || "",
    batch: student?.batch || ""
  });
  const [assessments, setAssessments] = useState(initialData?.assessments || []);

  // Sync state with initialData when editing
  useEffect(() => {
    if (initialData) {
      setPerformance(initialData.performance || {
        home_care_assistant: null,
        delivery_care_assistant: null,
        old_age_home_rehab: null,
        hospital_care: null,
        senior_citizens_assistant: null,
        icu_home_care_assistant: null,
        critical_illness_care_assistant: null,
        companionship_assistant: null,
        clinical_assistant: null,
      });
      setGeneral(initialData.general || {
        study_time_attendance: "",
        complaints_while_studies: "",
        willing_to_cooperate: null,
        follows_instruction: null,
        shows_respect_for_authority: null,
        considerate_towards_others: null,
        mix_well_with_others: null,
      });
      setAcademic(initialData.academic || {
        focused_on_studies: null,
        able_to_attend_independently: null,
        complies_with_study_regulations: null,
        willing_to_put_effort: null,
        able_to_manage_time_well: null,
      });
      setCharacter(initialData.character || {
        display_neatness: null,
        dress_appropriately: null,
        maintain_good_classmate_relation: null,
        shows_discipline_in_habits: null,
        show_care_for_others: null,
        adaptability_to_change: null,
        show_maturity: null,
        show_respectfulness: null,
        show_leadership_qualities: null,
      });
      setAssessmentMeta({
        duration: initialData?.report?.mark_assessment_duration || "",
        batch: student?.batch || ""
      });
      setAssessments(initialData.assessments || []);
    }
  }, [initialData, student]);

  // UI/UX improvement states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Section 6: Internal Assessment (read-only, derived)
  // ...

  // Tab navigation
  const tabs = [
    "Performance in Similar Area",
    "General Behavior",
    "Academic Behavior",
    "Character & Lifestyle",
    "Mark Assessment",
    "Internal Assessment (Summary)"
  ];

  // Enhanced submit handler
  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      await onSubmit({ performance, general, academic, character, assessmentMeta, assessments });
      setSuccess(true);
    } catch (e) {
      // Optionally handle error here
    } finally {
      setLoading(false);
    }
  };

  // Scroll to section on tab change
  const sectionRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [tab]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto min-h-[700px] flex flex-col justify-between" style={{ transition: 'min-height 0.2s' }}>
      <div>
        <div className="flex gap-2 mb-6 justify-center">
          {tabs.map((label, idx) => (
            <button
              key={label}
              className={`px-4 py-1 rounded-full text-xs font-semibold border transition-colors duration-150 ${tab === idx + 1 ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-indigo-50"}`}
              onClick={() => setTab(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <div ref={sectionRef} className="space-y-8 min-h-[500px] flex flex-col justify-between">
          <div className="w-full max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-slate-100">
            {tab === 1 && (
              <section className="bg-gray-100 rounded-xl shadow-md p-6 border border-slate-200 flex flex-col justify-between transition-all duration-200">
                <div>
                  <div className="mb-4 border-b pb-2 border-slate-200 flex items-center gap-2">
                    <span className="text-indigo-700 font-bold text-lg">1.</span>
                    <h2 className="font-bold text-lg tracking-wide">Performance in Similar Area</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(performance)
                      .filter(([key]) => key !== 'id' && key !== 'report_id')
                      .map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <label className="block text-sm mb-1 font-semibold capitalize text-slate-700">{key.replace(/_/g, " ")}</label>
                          <select
                            className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-indigo-200"
                            value={typeof value === "string" ? value : ""}
                            onChange={e => setPerformance({ ...performance, [key]: e.target.value })}
                          >
                            <option value="">Select</option>
                            {performanceOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                  </div>
                </div>
              </section>
            )}
            {tab === 2 && (
              <section className="bg-gray-100 rounded-xl shadow-md p-6 border border-slate-200 flex flex-col justify-between transition-all duration-200">
                <div>
                  <div className="mb-4 border-b pb-2 border-slate-200 flex items-center gap-2">
                    <span className="text-indigo-700 font-bold text-lg">2.</span>
                    <h2 className="font-bold text-lg tracking-wide">General Behavior</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1 font-semibold text-slate-700">Study Time Attendance</label>
                      <input className="border rounded px-2 py-1 w-full mb-2 focus:ring-2 focus:ring-indigo-200" value={general.study_time_attendance} onChange={e => setGeneral({ ...general, study_time_attendance: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 font-semibold text-slate-700">Complaints While Studies</label>
                      <input className="border rounded px-2 py-1 w-full mb-2 focus:ring-2 focus:ring-indigo-200" value={general.complaints_while_studies} onChange={e => setGeneral({ ...general, complaints_while_studies: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {Object.entries(general)
                      .filter(([k]) => k !== "study_time_attendance" && k !== "complaints_while_studies" && k !== 'id' && k !== 'report_id')
                      .map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <label className="block text-sm mb-1 font-semibold capitalize text-slate-700">{key.replace(/_/g, " ")}</label>
                          <div className="flex gap-2 flex-wrap">
                            {fivePointOptions.map(opt => (
                              <label key={opt} className="inline-flex items-center gap-1">
                                <input type="radio" name={key} value={opt} checked={value === opt} onChange={() => setGeneral({ ...general, [key]: opt })} />
                                <span>{opt.replace("_", " ")}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </section>
            )}
            {tab === 3 && (
              <section className="bg-gray-100 rounded-xl shadow-md p-6 border border-slate-200 flex flex-col justify-between transition-all duration-200">
                <div>
                  <div className="mb-4 border-b pb-2 border-slate-200 flex items-center gap-2">
                    <span className="text-indigo-700 font-bold text-lg">3.</span>
                    <h2 className="font-bold text-lg tracking-wide">Academic Behavior</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(academic)
                      .filter(([key]) => key !== 'id' && key !== 'report_id')
                      .map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <label className="block text-sm mb-1 font-semibold capitalize text-slate-700">{key.replace(/_/g, " ")}</label>
                          <div className="flex gap-2 flex-wrap">
                            {fivePointOptions.map(opt => (
                              <label key={opt} className="inline-flex items-center gap-1">
                                <input type="radio" name={key} value={opt} checked={value === opt} onChange={() => setAcademic({ ...academic, [key]: opt })} />
                                <span>{opt.replace("_", " ")}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </section>
            )}
            {tab === 4 && (
              <section className="bg-gray-100 rounded-xl shadow-md p-6 border border-slate-200 flex flex-col justify-between transition-all duration-200">
                <div>
                  <div className="mb-4 border-b pb-2 border-slate-200 flex items-center gap-2">
                    <span className="text-indigo-700 font-bold text-lg">4.</span>
                    <h2 className="font-bold text-lg tracking-wide">Character & Lifestyle</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(character)
                      .filter(([key]) => key !== 'id' && key !== 'report_id')
                      .map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <label className="block text-sm mb-1 font-semibold capitalize text-slate-700">{key.replace(/_/g, " ")}</label>
                          <div className="flex gap-2 flex-wrap">
                            {fivePointOptions.map(opt => (
                              <label key={opt} className="inline-flex items-center gap-1">
                                <input type="radio" name={key} value={opt} checked={value === opt} onChange={() => setCharacter({ ...character, [key]: opt })} />
                                <span>{opt.replace("_", " ")}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </section>
            )}
            {tab === 5 && (
              <section className="bg-gray-100 rounded-xl shadow-md p-6 border border-slate-200 flex flex-col justify-between transition-all duration-200">
                <div>
                  <div className="mb-4 border-b pb-2 border-slate-200 flex items-center gap-2">
                    <span className="text-indigo-700 font-bold text-lg">5.</span>
                    <h2 className="font-bold text-lg tracking-wide">Mark Assessment</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm mb-1 font-semibold text-slate-700">Course Name</label>
                      <input className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-indigo-200" value={student?.course || ""} readOnly />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 font-semibold text-slate-700">Batch</label>
                      <input className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-indigo-200" value={assessmentMeta.batch} readOnly />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 font-semibold text-slate-700">Duration</label>
                      <input className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-indigo-200" value={assessmentMeta.duration} onChange={e => setAssessmentMeta({ ...assessmentMeta, duration: e.target.value })} />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm mb-1 font-semibold text-slate-700">Assessments</label>
                    {assessments.map((a: any, idx: number) => (
                      <div key={idx} className="border rounded-xl p-4 mb-5 bg-slate-50 shadow-sm flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-slate-700 mb-1">Assessment Type</label>
                            <select className="border rounded px-2 py-1" value={a.assessment_type} onChange={e => {
                              const arr = [...assessments]; arr[idx].assessment_type = e.target.value; setAssessments(arr);
                            }}>
                              <option value="">Type</option>
                              {assessmentTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-slate-700 mb-1">Topic</label>
                            <input className="border rounded px-2 py-1" placeholder="Topic" value={a.topic || ""} onChange={e => { const arr = [...assessments]; arr[idx].topic = e.target.value; setAssessments(arr); }} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-slate-700 mb-1">Mark Scored</label>
                            <input className="border rounded px-2 py-1" placeholder="Mark Scored" type="number" value={a.mark_scored || ""} onChange={e => { const arr = [...assessments]; arr[idx].mark_scored = e.target.value; setAssessments(arr); }} />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-slate-700 mb-1">Min Mark</label>
                            <input className="border rounded px-2 py-1" placeholder="Min Mark" type="number" value={a.min_mark || ""} onChange={e => { const arr = [...assessments]; arr[idx].min_mark = e.target.value; setAssessments(arr); }} />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-slate-700 mb-1">Max Mark</label>
                            <input className="border rounded px-2 py-1" placeholder="Max Mark" type="number" value={a.max_mark || ""} onChange={e => { const arr = [...assessments]; arr[idx].max_mark = e.target.value; setAssessments(arr); }} />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-slate-700 mb-1">Total Mark</label>
                            <input className="border rounded px-2 py-1" placeholder="Total Mark" type="number" value={a.total_mark || ""} onChange={e => { const arr = [...assessments]; arr[idx].total_mark = e.target.value; setAssessments(arr); }} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-slate-700 mb-1">Practical Type</label>
                            <input className="border rounded px-2 py-1" placeholder="Practical Type" value={a.practical_type || ""} onChange={e => { const arr = [...assessments]; arr[idx].practical_type = e.target.value; setAssessments(arr); }} />
                          </div>
                          <div className="flex flex-col col-span-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="flex flex-col">
                                <label className="text-xs font-medium text-slate-700 mb-1">Submission Date</label>
                                <input className="border rounded px-2 py-1" placeholder="Submission Date" type="date" value={a.submission_date || ""} onChange={e => { const arr = [...assessments]; arr[idx].submission_date = e.target.value; setAssessments(arr); }} />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-medium text-slate-700 mb-1">Last Date of Submission</label>
                                <input className="border rounded px-2 py-1" placeholder="Last Date of Submission" type="date" value={a.last_date_of_submission || ""} onChange={e => { const arr = [...assessments]; arr[idx].last_date_of_submission = e.target.value; setAssessments(arr); }} />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-medium text-slate-700 mb-1">Date Student Submitted</label>
                                <input className="border rounded px-2 py-1" placeholder="Date Student Submitted" type="date" value={a.date_student_submitted || ""} onChange={e => { const arr = [...assessments]; arr[idx].date_student_submitted = e.target.value; setAssessments(arr); }} />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-medium text-slate-700 mb-1">Submission Status</label>
                                <select className="border rounded px-2 py-1" value={a.submission_status || ""} onChange={e => { const arr = [...assessments]; arr[idx].submission_status = e.target.value; setAssessments(arr); }}>
                                  <option value="">Submission Status</option>
                                  {submissionStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-2">
                          <button className="text-xs text-red-600 px-3 py-1 rounded hover:bg-red-50 transition" onClick={() => setAssessments(assessments.filter((_: any, i: number) => i !== idx))}>Remove</button>
                        </div>
                      </div>
                    ))}
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs mt-2" onClick={() => setAssessments([...assessments, { assessment_type: "", topic: "" }])}>Add Assessment</button>
                  </div>
                </div>
              </section>
            )}
            {tab === 6 && (
              <section className="bg-gray-100 rounded-xl shadow-md p-6 border border-slate-200 flex flex-col gap-6 transition-all duration-200">
                <div>
                  <div className="mb-4 border-b pb-2 border-slate-200 flex items-center gap-2">
                    <span className="text-indigo-700 font-bold text-lg">6.</span>
                    <h2 className="font-bold text-lg tracking-wide">Internal Assessment (Summary)</h2>
                  </div>
                  <div className="text-slate-600 text-sm mb-6">This section is read-only and shows exactly what you entered in the previous sections.</div>
                  <div className="flex flex-col gap-6">
                    {/* GENERAL BEHAVIOR */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col gap-2">
                      <h3 className="font-semibold text-indigo-700 mb-2 text-base border-b pb-1 border-slate-100">A. General Behavior</h3>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between"><span>Study Time Attendance</span><span className="font-mono">{general.study_time_attendance || '-'}</span></div>
                        <div className="flex justify-between"><span>Follows Instruction</span><span className="font-mono">{general.follows_instruction || '-'}</span></div>
                        <div className="flex justify-between"><span>Shows Respect For Authority</span><span className="font-mono">{general.shows_respect_for_authority || '-'}</span></div>
                      </div>
                    </div>
                    {/* ACADEMIC BEHAVIOR */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col gap-2">
                      <h3 className="font-semibold text-indigo-700 mb-2 text-base border-b pb-1 border-slate-100">B. Academic Behavior</h3>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between"><span>Focused On Studies</span><span className="font-mono">{academic.focused_on_studies || '-'}</span></div>
                        <div className="flex justify-between"><span>Willing To Put Effort Into Daily Work</span><span className="font-mono">{academic.willing_to_put_effort || '-'}</span></div>
                        <div className="flex justify-between"><span>Able To Manage Time Well</span><span className="font-mono">{academic.able_to_manage_time_well || '-'}</span></div>
                      </div>
                    </div>
                    {/* CHARACTER & LIFESTYLE */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col gap-2">
                      <h3 className="font-semibold text-indigo-700 mb-2 text-base border-b pb-1 border-slate-100">C. Character & Lifestyle</h3>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between"><span>Display Neatness & Cleanliness</span><span className="font-mono">{character.display_neatness || '-'}</span></div>
                        <div className="flex justify-between"><span>Dress Appropriately</span><span className="font-mono">{character.dress_appropriately || '-'}</span></div>
                        <div className="flex justify-between"><span>Maintain Good Classmate Relation</span><span className="font-mono">{character.maintain_good_classmate_relation || '-'}</span></div>
                        <div className="flex justify-between"><span>Shows Discipline In Personal Habits</span><span className="font-mono">{character.shows_discipline_in_habits || '-'}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
      {success && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 text-center font-semibold mt-6">Report submitted successfully!</div>
      )}
      <div className="flex flex-wrap gap-2 mt-8 justify-between items-center">
        <div className="flex gap-2">
          <button
            className={`bg-slate-200 px-6 py-2 rounded font-semibold shadow ${tab === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => tab > 1 && setTab(tab - 1)}
            disabled={tab === 1}
          >
            Previous
          </button>
          <button
            className={`bg-slate-200 px-6 py-2 rounded font-semibold shadow ${tab === tabs.length ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => tab < tabs.length && setTab(tab + 1)}
            disabled={tab === tabs.length}
          >
            Next
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className={`bg-indigo-600 text-white px-6 py-2 rounded font-semibold shadow ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button className="bg-slate-200 px-6 py-2 rounded font-semibold shadow" onClick={onCancel} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
