import React, { useState, useEffect } from 'react';
import { X, Users, BookOpen, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface AssignedStudent {
  id: string;
  name: string;
  email: string;
  mobile: string;
  course: string;
  register_no: string | null;
  batch: string;
  roll_no: number | null;
  created_at: string;
}

interface BatchTransferOverlayProps {
  onClose: () => void;
  onTransfer: () => void;
}

export function BatchTransferOverlay({ onClose, onTransfer }: BatchTransferOverlayProps) {
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [fromBatch, setFromBatch] = useState<string>('');
  const [toBatch, setToBatch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const batchOptions = ['A', 'B', 'C'];

  useEffect(() => {
    fetchAssignedStudents();
  }, []);

  useEffect(() => {
    if (fromBatch) {
      fetchStudentsFromBatch(fromBatch);
    } else {
      setAssignedStudents([]);
    }
    setSelectedStudents(new Set());
  }, [fromBatch]);

  const fetchAssignedStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('id, name, email, mobile, course, register_no, batch, roll_no, created_at')
        .not('batch', 'is', null)
        .order('batch', { ascending: true })
        .order('course', { ascending: true })
        .order('roll_no', { ascending: true });

      if (error) throw error;
      setAssignedStudents(data || []);
    } catch (error) {
      console.error('Error fetching assigned students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsFromBatch = async (batch: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('id, name, email, mobile, course, register_no, batch, roll_no, created_at')
        .eq('batch', batch)
        .order('course', { ascending: true })
        .order('roll_no', { ascending: true });

      if (error) throw error;
      setAssignedStudents(data || []);
    } catch (error) {
      console.error('Error fetching students from batch:', error);
      toast.error('Failed to fetch students from selected batch');
    } finally {
      setLoading(false);
    }
  };

  const getNextAvailableRollNumbers = async (batch: string, course: string, count: number): Promise<number[]> => {
    try {
      // Get all existing roll numbers for this batch and course
      const { data, error } = await supabase
        .from('students')
        .select('roll_no')
        .eq('batch', batch)
        .eq('course', course)
        .not('roll_no', 'is', null)
        .order('roll_no', { ascending: true });

      if (error) throw error;
      
      const existingRollNumbers = new Set((data || []).map(student => student.roll_no));
      const availableRollNumbers: number[] = [];
      
      let currentRoll = 1;
      while (availableRollNumbers.length < count) {
        if (!existingRollNumbers.has(currentRoll)) {
          availableRollNumbers.push(currentRoll);
        }
        currentRoll++;
      }
      
      return availableRollNumbers;
    } catch (error) {
      console.error('Error getting available roll numbers:', error);
      // Fallback: return sequential numbers starting from a high number
      const fallbackStart = 1000 + Math.floor(Math.random() * 1000);
      return Array.from({ length: count }, (_, i) => fallbackStart + i);
    }
  };

  const handleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleTransferBatch = async () => {
    if (!fromBatch) {
      toast.error('Please select source batch');
      return;
    }

    if (!toBatch) {
      toast.error('Please select destination batch');
      return;
    }

    if (fromBatch === toBatch) {
      toast.error('Source and destination batch cannot be the same');
      return;
    }

    if (selectedStudents.size === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setIsTransferring(true);
    try {
      // Group students by course to assign consecutive roll numbers
      const studentsByCourse = new Map<string, AssignedStudent[]>();
      
      Array.from(selectedStudents).forEach(studentId => {
        const student = assignedStudents.find(s => s.id === studentId);
        if (student) {
          if (!studentsByCourse.has(student.course)) {
            studentsByCourse.set(student.course, []);
          }
          studentsByCourse.get(student.course)!.push(student);
        }
      });

      // Transfer students and assign new roll numbers
      for (const [course, courseStudents] of studentsByCourse) {
        // Get available roll numbers for this course in the destination batch
        const availableRollNumbers = await getNextAvailableRollNumbers(toBatch, course, courseStudents.length);
        
        for (let i = 0; i < courseStudents.length; i++) {
          const student = courseStudents[i];
          const newRollNo = availableRollNumbers[i];
          
          const { error } = await supabase
            .from('students')
            .update({
              batch: toBatch,
              roll_no: newRollNo
            })
            .eq('id', student.id);

          if (error) {
            console.error(`Error transferring student ${student.id}:`, error);
            throw error;
          }
        }
      }

      toast.success(`Successfully transferred ${selectedStudents.size} student(s) from Batch ${fromBatch} to Batch ${toBatch}`);
      
      // Reset the form state
      setSelectedStudents(new Set());
      setFromBatch('');
      setToBatch('');
      setSearchTerm('');
      
      // Refresh the students list
      await fetchAssignedStudents();
      
      // Call the parent callback
      onTransfer();
    } catch (error) {
      console.error('Error transferring students:', error);
      toast.error('Failed to transfer students. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  const filteredStudents = assignedStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.register_no && student.register_no.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Transfer Batch</h2>
              <p className="text-sm text-gray-500">Transfer students from one batch to another</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Batch Selection */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Batch
              </label>
              <select
                value={fromBatch}
                onChange={(e) => setFromBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select source batch...</option>
                {batchOptions.map(batch => (
                  <option key={batch} value={batch}>Batch {batch}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-center items-center">
              <ArrowRight className="h-6 w-6 text-gray-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Batch
              </label>
              <select
                value={toBatch}
                onChange={(e) => setToBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!fromBatch}
              >
                <option value="">Select destination batch...</option>
                {batchOptions
                  .filter(batch => batch !== fromBatch)
                  .map(batch => (
                    <option key={batch} value={batch}>Batch {batch}</option>
                  ))}
              </select>
            </div>
          </div>

          {fromBatch && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Students in Batch {fromBatch}
              </label>
              <input
                type="text"
                placeholder="Search by name, email, course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!fromBatch ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Source Batch</h3>
                <p className="text-gray-500">Choose a batch to see students available for transfer.</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Loading students...</p>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                <p className="text-gray-500">
                  {assignedStudents.length === 0 
                    ? `No students found in Batch ${fromBatch}.`
                    : "No students match your search criteria."
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Students in Batch {fromBatch} ({filteredStudents.length})
                </h3>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {selectedStudents.size === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Students Grid */}
              <div className="grid grid-cols-1 gap-3">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedStudents.has(student.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleStudentSelection(student.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{student.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{student.register_no || 'No register number'}</span>
                              <span>•</span>
                              <span>Roll No: {student.roll_no || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {student.course}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                Batch {student.batch}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-white">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedStudents.size} student(s) selected
              {fromBatch && toBatch && ` to transfer from Batch ${fromBatch} to Batch ${toBatch}`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleTransferBatch}
                disabled={!fromBatch || !toBatch || selectedStudents.size === 0 || isTransferring}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isTransferring ? 'Transferring...' : 'Transfer Students'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
