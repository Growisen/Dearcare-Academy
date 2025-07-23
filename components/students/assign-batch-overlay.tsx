import React, { useState, useEffect } from 'react';
import { X, Users, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface UnassignedStudent {
  id: string;
  name: string;
  email: string;
  mobile: string;
  course: string;
  register_no: string | null;
  created_at: string;
}

interface AssignBatchOverlayProps {
  onClose: () => void;
  onAssign: () => void;
}

export function AssignBatchOverlay({ onClose, onAssign }: AssignBatchOverlayProps) {
  const [unassignedStudents, setUnassignedStudents] = useState<UnassignedStudent[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const batchOptions = ['A', 'B', 'C'];

  useEffect(() => {
    fetchUnassignedStudents();
  }, []);

  const fetchUnassignedStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('id, name, email, mobile, course, register_no, created_at')
        .is('batch', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnassignedStudents(data || []);
    } catch (error) {
      console.error('Error fetching unassigned students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const getNextRollNumber = async (batch: string, course: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('roll_no')
        .eq('batch', batch)
        .eq('course', course)
        .order('roll_no', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0 && data[0].roll_no) {
        return data[0].roll_no + 1;
      }
      return 1; // Start from 1 if no students in this batch/course combination
    } catch (error) {
      console.error('Error getting next roll number:', error);
      return 1;
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

  const handleAssignBatch = async () => {
    if (!selectedBatch) {
      toast.error('Please select a batch');
      return;
    }

    if (selectedStudents.size === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setIsAssigning(true);
    try {
      // Group students by course to assign consecutive roll numbers
      const studentsByTourse = new Map<string, UnassignedStudent[]>();
      
      Array.from(selectedStudents).forEach(studentId => {
        const student = unassignedStudents.find(s => s.id === studentId);
        if (student) {
          if (!studentsByTourse.has(student.course)) {
            studentsByTourse.set(student.course, []);
          }
          studentsByTourse.get(student.course)!.push(student);
        }
      });

      // Assign batch and roll numbers
      for (const [course, courseStudents] of studentsByTourse) {
        let nextRollNo = await getNextRollNumber(selectedBatch, course);
        
        for (const student of courseStudents) {
          const { error } = await supabase
            .from('students')
            .update({
              batch: selectedBatch,
              roll_no: nextRollNo
            })
            .eq('id', student.id);

          if (error) {
            console.error(`Error updating student ${student.id}:`, error);
            throw error;
          }
          
          nextRollNo++;
        }
      }

      toast.success(`Successfully assigned ${selectedStudents.size} student(s) to batch ${selectedBatch}`);
      onAssign();
      onClose();
    } catch (error) {
      console.error('Error assigning batch:', error);
      toast.error('Failed to assign batch. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredStudents = unassignedStudents.filter(student =>
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
              <h2 className="text-xl font-semibold text-gray-900">Assign Batch</h2>
              <p className="text-sm text-gray-500">Assign students to batches and generate roll numbers</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Batch Selection */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose batch...</option>
                {batchOptions.map(batch => (
                  <option key={batch} value={batch}>Batch {batch}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Students
              </label>
              <input
                type="text"
                placeholder="Search by name, email, course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
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
                  {unassignedStudents.length === 0 
                    ? "All students have been assigned to batches."
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
                  Students without Batch ({filteredStudents.length})
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
                            <p className="text-sm text-gray-500">{student.register_no || 'No register number'}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {student.course}
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
              {selectedBatch && ` for Batch ${selectedBatch}`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignBatch}
                disabled={!selectedBatch || selectedStudents.size === 0 || isAssigning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isAssigning ? 'Assigning...' : 'Assign Batch'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
