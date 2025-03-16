import React, { useState } from 'react';
import Map from '../map/Map';

interface ApprovedContentProps {
  client: {
    id: string
    shift?: string
    description?: string
    location: string;
    condition?: string
    assignedNurse?: string;
    medications?: string[]
    specialInstructions?: string
    nurseLocation?: { lat: number; lng: number }
    clientLocation?: { lat: number; lng: number }
  };
}

const ratingOptions = ['All Ratings', ...[1, 2, 3, 4, 5].map(rating => `<=${rating}`)];
const experienceOptions = ['All Experience', ...Array.from({ length: 11 }, (_, i) => i.toString())];
const salaryOptions = ['All Salaries', ...[500, 600, 700, 800, 900, 1000].map(String)];

const FilterInput = ({ label, type, value, onChange }: { label: string, type: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input type={type} value={value} onChange={onChange} className="w-full p-2 border rounded-lg" />
  </div>
);

const FilterDropdown = ({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select value={value} onChange={onChange} className="w-full p-2 border rounded-lg">
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const NurseCard = ({ nurse, onRemove, isAssigned = false }: { nurse: any, onRemove: (id: string) => void, isAssigned?: boolean }) => (
  <div 
    key={nurse._id}
    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
  >
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-xl text-gray-600">
          {nurse.firstName[0]}
          {nurse.lastName[0]}
        </span>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-900">
          {nurse.firstName} {nurse.lastName}
        </h4>
        <p className="text-sm text-gray-500">
          {nurse.experience} years exp. | Rating: {nurse.rating}/5 | Salary: ₹{nurse.salaryPerHour}/hr
        </p>
      </div>
    </div>
    {isAssigned && (
      <button
        onClick={() => onRemove(nurse._id)}
        className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
      >
        Remove
      </button>
    )}
  </div>
);

export function ApprovedContent({ client }: ApprovedContentProps) {
  const [showNurseList, setShowNurseList] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState(client);
  const [filters, setFilters] = useState({ experience: 'All Experience', rating: 'All Ratings', salary: 'All Salaries', location: client.location });
  const [searchTerm, setSearchTerm] = useState('');

  const [nurses] = useState([
    {
      _id: "1",
      firstName: "Anjali",
      lastName: "Menon",
      location: "Kochi",
      status: "unassigned",
      email: "anjali.menon@example.com",
      phoneNumber: "123-456-7890",
      gender: "Female",
      dob: "1990-01-01",
      salaryPerHour: 900,
      hiringDate: "2020-01-01",
      experience: 5,
      rating: 4.5,
      reviews: [
        { id: "r1", text: "Great nurse!", date: "2021-01-01", rating: 5, reviewer: "John Doe" },
        { id: "r2", text: "Very professional.", date: "2021-06-15", rating: 4, reviewer: "Jane Smith" }
      ],
      preferredLocations: ["Kollam", "Palakkad", "Malappuram"]
    },
    {
      _id: "2",
      firstName: "Ravi",
      lastName: "Nair",
      location: "Thiruvananthapuram",
      status: "assigned",
      email: "ravi.nair@example.com",
      phoneNumber: "987-654-3210",
      gender: "Male",
      dob: "1985-05-15",
      salaryPerHour: 800,
      hiringDate: "2018-05-15",
      experience: 8,
      rating: 4,
      reviews: [
        { id: "r3", text: "Good service.", date: "2020-03-10", rating: 4, reviewer: "Anjali Menon" }
      ],
      preferredLocations: ["Palakkad"]
    }
  ]);

  const assignedNurse = nurses.find(nurse => nurse._id === client.assignedNurse);

  const handleAssignNurse = (nurseId: string) => {
    setShowNurseList(false);
    // Here you would typically make an API call to update the assignment
  };

  const handleRemoveNurse = (nurseId: string) => {
    // Here you would typically make an API call to remove the assignment
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedClient(client);
    setIsEditing(false);
  };

  const handleMedicationChange = (index: number, value: string) => {
    const newMedications = [...(editedClient.medications || [])];
    newMedications[index] = value;
    setEditedClient({ ...editedClient, medications: newMedications });
  };

  const addMedication = () => {
    setEditedClient({
      ...editedClient,
      medications: [...(editedClient.medications || []), '']
    });
  };

  const removeMedication = (index: number) => {
    const newMedications = [...(editedClient.medications || [])];
    newMedications.splice(index, 1);
    setEditedClient({ ...editedClient, medications: newMedications });
  };

  const filteredNurses = nurses.filter(nurse => (
    (filters.experience === 'All Experience' || nurse.experience >= parseInt(filters.experience)) &&
    (filters.rating === 'All Ratings' || (nurse.rating || 0) <= parseInt(filters.rating.replace('<=', ''))) &&
    (filters.salary === 'All Salaries' || nurse.salaryPerHour <= parseInt(filters.salary)) &&
    (filters.location === '' || nurse.preferredLocations.includes(filters.location)) &&
    (nurse.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || nurse.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  ));

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold text-gray-800">Care Details</h3>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                >
                  Save Changes
                </button>
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium"
                >
                  Edit Details
                </button>
                <button className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200 text-sm font-medium">
                  End Care
                </button>
              </>
            )}
          </div>
        </div>
        <div className="rounded-xl space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Medical Condition</h4>
            {isEditing ? (
              <textarea
                value={editedClient.condition || ''}
                onChange={(e) => setEditedClient({ ...editedClient, condition: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm text-gray-600"
                rows={2}
              />
            ) : (
              <p className="text-sm text-gray-600">{editedClient.condition}</p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Description</h4>
            {isEditing ? (
              <textarea
                value={editedClient.description || ''}
                onChange={(e) => setEditedClient({ ...editedClient, description: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm text-gray-600"
                rows={4}
              />
            ) : (
              <p className="text-sm text-gray-600">{editedClient.description}</p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Medications</h4>
            {isEditing ? (
              <div className="space-y-2">
                {(editedClient.medications || []).map((med, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={med}
                      onChange={(e) => handleMedicationChange(index, e.target.value)}
                      className="flex-1 p-2 border rounded-lg text-sm"
                    />
                    <button
                      onClick={() => removeMedication(index)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addMedication}
                  className="text-blue-600 text-sm hover:text-blue-700"
                >
                  + Add Medication
                </button>
              </div>
            ) : (
              <ul className="list-disc list-inside text-sm text-gray-600">
                {editedClient.medications?.map((med, index) => (
                  <li key={index}>{med}</li>
                )) || <li>Lisinopril</li>}
              </ul>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Care Instructions</h4>
            {isEditing ? (
              <textarea
                value={editedClient.specialInstructions || ''}
                onChange={(e) => setEditedClient({ ...editedClient, specialInstructions: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm text-gray-600"
                rows={4}
              />
            ) : (
              <p className="text-sm text-gray-600">{editedClient.specialInstructions || 'Monitor blood pressure daily'}</p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2 flex justify-between items-center">
              Assigned Nurses
              <button 
                onClick={() => setShowNurseList(true)}
                className="px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                Assign Nurse
              </button>
            </h4>
            <div className="p-4 border rounded-lg">
              {assignedNurse ? (
                <NurseCard 
                  nurse={assignedNurse} 
                  onRemove={handleRemoveNurse} 
                  isAssigned={true}
                />
              ) : (
                <div className="text-center text-gray-600">
                  <p>No nurse assigned</p>
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Track Location</h4>
            <div className="h-64 rounded-xl overflow-hidden border">
              {/* <Map clientLocation={client.clientLocation} /> */}
            </div>
          </div>
        </div>
      </div>

      {showNurseList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Assign Nurse</h3>
              <button 
                onClick={() => setShowNurseList(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by nurse name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-lg mb-4"
              />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FilterDropdown label="Min Experience (years)" options={experienceOptions} value={filters.experience} onChange={(e) => setFilters({...filters, experience: e.target.value})} />
                <FilterDropdown label="Max Rating" options={ratingOptions} value={filters.rating} onChange={(e) => setFilters({...filters, rating: e.target.value})} />
                <FilterDropdown label="Max Salary" options={salaryOptions} value={filters.salary} onChange={(e) => setFilters({...filters, salary: e.target.value})} />
                <FilterInput label="Preferred Location" type="text" value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})} />
              </div>
            </div>

            {filteredNurses.length > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                {filteredNurses.length} result{filteredNurses.length > 1 ? 's' : ''} found
              </p>
            )}
            <div className="space-y-4">
              {filteredNurses.map((nurse) => (
                <NurseCard key={nurse._id} nurse={nurse} onRemove={handleRemoveNurse} />
              ))}
              {filteredNurses.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No nurses match the selected filters
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovedContent;