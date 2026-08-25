import React, { useState } from 'react';
import { 
  Database, 
  Table as TableIcon, 
  X, 
  Check, 
  Sparkles, 
  FileText, 
  RefreshCw
} from 'lucide-react';

export interface SqlPreset {
  id: string;
  name: string;
  description: string;
  schemaSql: string;
  tables: Array<{
    name: string;
    columns: string[];
    sampleRows: any[][];
  }>;
}

export const SQL_PRESETS: SqlPreset[] = [
  {
    id: 'employees_departments',
    name: '🏢 Employees & Departments',
    description: 'Classic interview schema with departments, salaries, hire dates, and manager relationships.',
    schemaSql: `-- Departments Table
CREATE TABLE departments (
  department_id INTEGER PRIMARY KEY,
  department_name TEXT NOT NULL,
  location TEXT NOT NULL
);

INSERT INTO departments VALUES 
  (1, 'Engineering', 'San Francisco'),
  (2, 'Product', 'New York'),
  (3, 'Sales', 'Chicago'),
  (4, 'Marketing', 'London'),
  (5, 'HR', 'Austin');

-- Employees Table
CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  department_id INTEGER,
  salary INTEGER NOT NULL,
  hire_date DATE NOT NULL,
  manager_id INTEGER,
  FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

INSERT INTO employees VALUES
  (101, 'Alex', 'Rivera', 1, 145000, '2021-03-15', NULL),
  (102, 'Sara', 'Chen', 1, 160000, '2020-06-01', 101),
  (103, 'Michael', 'Scott', 3, 115000, '2019-01-10', NULL),
  (104, 'Dwight', 'Schrute', 3, 95000, '2019-04-20', 103),
  (105, 'Jim', 'Halpert', 3, 92000, '2020-02-14', 103),
  (106, 'Pam', 'Beesly', 5, 65000, '2021-08-01', NULL),
  (107, 'Elena', 'Rostova', 2, 138000, '2022-01-10', 101),
  (108, 'David', 'Kim', 1, 125000, '2022-09-18', 101),
  (109, 'Rachel', 'Green', 4, 88000, '2021-11-05', NULL),
  (110, 'Marcus', 'Vance', 1, 175000, '2018-05-12', 101);
`,
    tables: [
      {
        name: 'departments',
        columns: ['department_id', 'department_name', 'location'],
        sampleRows: [
          [1, 'Engineering', 'San Francisco'],
          [2, 'Product', 'New York'],
          [3, 'Sales', 'Chicago'],
          [4, 'Marketing', 'London'],
          [5, 'HR', 'Austin']
        ]
      },
      {
        name: 'employees',
        columns: ['employee_id', 'first_name', 'last_name', 'department_id', 'salary', 'hire_date'],
        sampleRows: [
          [101, 'Alex', 'Rivera', 1, 145000, '2021-03-15'],
          [102, 'Sara', 'Chen', 1, 160000, '2020-06-01'],
          [103, 'Michael', 'Scott', 3, 115000, '2019-01-10'],
          [104, 'Dwight', 'Schrute', 3, 95000, '2019-04-20'],
          [105, 'Jim', 'Halpert', 3, 92000, '2020-02-14']
        ]
      }
    ]
  },
  {
    id: 'customers_orders',
    name: '🛒 Customers & Orders (E-Commerce)',
    description: 'E-commerce analytics with customer spending, order status, and transaction dates.',
    schemaSql: `-- Customers Table
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at DATE NOT NULL
);

INSERT INTO customers VALUES
  (1, 'Alice Johnson', 'USA', '2022-01-15'),
  (2, 'Bob Smith', 'Canada', '2022-03-22'),
  (3, 'Charlie Brown', 'UK', '2022-05-10'),
  (4, 'Diana Prince', 'USA', '2022-07-04'),
  (5, 'Evan Wright', 'Germany', '2022-09-18');

-- Orders Table
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date DATE NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

INSERT INTO orders VALUES
  (1001, 1, '2023-01-10', 250.50, 'COMPLETED'),
  (1002, 1, '2023-02-14', 120.00, 'COMPLETED'),
  (1003, 2, '2023-01-25', 450.00, 'COMPLETED'),
  (1004, 3, '2023-03-05', 85.00, 'CANCELLED'),
  (1005, 4, '2023-03-12', 310.20, 'COMPLETED'),
  (1006, 1, '2023-04-01', 95.00, 'COMPLETED'),
  (1007, 5, '2023-04-18', 620.00, 'COMPLETED');
`,
    tables: [
      {
        name: 'customers',
        columns: ['customer_id', 'name', 'country', 'created_at'],
        sampleRows: [
          [1, 'Alice Johnson', 'USA', '2022-01-15'],
          [2, 'Bob Smith', 'Canada', '2022-03-22'],
          [3, 'Charlie Brown', 'UK', '2022-05-10']
        ]
      },
      {
        name: 'orders',
        columns: ['order_id', 'customer_id', 'order_date', 'total_amount', 'status'],
        sampleRows: [
          [1001, 1, '2023-01-10', 250.50, 'COMPLETED'],
          [1002, 1, '2023-02-14', 120.00, 'COMPLETED'],
          [1003, 2, '2023-01-25', 450.00, 'COMPLETED']
        ]
      }
    ]
  },
  {
    id: 'students_courses',
    name: '🎓 Students & Course Enrollments',
    description: 'University database with student grades, GPAs, and course enrollments.',
    schemaSql: `-- Courses Table
CREATE TABLE courses (
  course_id TEXT PRIMARY KEY,
  course_name TEXT NOT NULL,
  credits INTEGER NOT NULL
);

INSERT INTO courses VALUES
  ('CS101', 'Intro to Computer Science', 4),
  ('CS201', 'Data Structures & Algorithms', 4),
  ('MATH150', 'Linear Algebra', 3),
  ('DB301', 'Database Systems', 3);

-- Students Table
CREATE TABLE students (
  student_id INTEGER PRIMARY KEY,
  student_name TEXT NOT NULL,
  major TEXT NOT NULL
);

INSERT INTO students VALUES
  (1, 'Emma Watson', 'Computer Science'),
  (2, 'Liam Neeson', 'Mathematics'),
  (3, 'Olivia Wilde', 'Computer Science'),
  (4, 'Noah Centineo', 'Data Science');

-- Enrollments Table
CREATE TABLE enrollments (
  student_id INTEGER,
  course_id TEXT,
  grade REAL,
  semester TEXT,
  PRIMARY KEY (student_id, course_id)
);

INSERT INTO enrollments VALUES
  (1, 'CS101', 3.8, 'Fall 2023'),
  (1, 'CS201', 4.0, 'Spring 2024'),
  (2, 'MATH150', 3.9, 'Fall 2023'),
  (3, 'CS101', 3.5, 'Fall 2023'),
  (3, 'DB301', 3.7, 'Spring 2024'),
  (4, 'CS101', 3.9, 'Fall 2023');
`,
    tables: [
      {
        name: 'students',
        columns: ['student_id', 'student_name', 'major'],
        sampleRows: [
          [1, 'Emma Watson', 'Computer Science'],
          [2, 'Liam Neeson', 'Mathematics'],
          [3, 'Olivia Wilde', 'Computer Science']
        ]
      },
      {
        name: 'courses',
        columns: ['course_id', 'course_name', 'credits'],
        sampleRows: [
          ['CS101', 'Intro to Computer Science', 4],
          ['CS201', 'Data Structures & Algorithms', 4]
        ]
      }
    ]
  }
];

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemaSql: string;
  onSaveSchema: (newSchemaSql: string) => void;
}

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({
  isOpen,
  onClose,
  schemaSql,
  onSaveSchema
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'editor' | 'preview'>('presets');
  const [draftSql, setDraftSql] = useState<string>(schemaSql || SQL_PRESETS[0].schemaSql);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('employees_departments');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: SqlPreset) => {
    setSelectedPresetId(preset.id);
    setDraftSql(preset.schemaSql);
    onSaveSchema(preset.schemaSql);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSchema(draftSql);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const currentPreset = SQL_PRESETS.find(p => p.id === selectedPresetId) || SQL_PRESETS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-3xl bg-[#0d121f] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-5 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>SQL Database & Schema Manager</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Create & Import Database Tables
            </h2>
            <p className="text-xs text-slate-400">
              Tables and mock data defined here are automatically injected when running SQL queries in the live room.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preset Interview Schemas</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Custom DDL & Seed Script</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Visual Table Viewer</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
          {/* 1. Presets Tab */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">
                Select a ready-to-query interview schema:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SQL_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-white block group-hover:text-cyan-300 transition-colors">
                          {preset.name}
                        </span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono">
                        <span className="text-cyan-400 font-bold">
                          {preset.tables.map(t => t.name).join(', ')}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sample Tables Overview */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    Active Tables for <span className="text-cyan-300 font-mono">{currentPreset.name}</span>:
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Auto-created before queries
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {currentPreset.tables.map((tbl, i) => (
                    <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                        <TableIcon className="w-3.5 h-3.5" />
                        <span>{tbl.name}</span>
                      </div>
                      <div className="text-slate-400 text-[10px] flex flex-wrap gap-1">
                        {tbl.columns.map((c, ci) => (
                          <span key={ci} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Custom SQL Editor Tab */}
          {activeTab === 'editor' && (
            <form onSubmit={handleSaveCustom} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Custom DDL Setup & Insert Statements:
                </span>
                <button
                  type="button"
                  onClick={() => setDraftSql(SQL_PRESETS[0].schemaSql)}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Reset to Employees & Departments
                </button>
              </div>

              <textarea
                rows={12}
                value={draftSql}
                onChange={(e) => setDraftSql(e.target.value)}
                placeholder="CREATE TABLE my_table (id INT, name TEXT);&#10;INSERT INTO my_table VALUES (1, 'Alice');"
                className="w-full p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs font-mono text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Tip: Write any standard SQLite / PostgreSQL CREATE TABLE & INSERT statements.
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Custom Schema</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. Visual Table Viewer Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {currentPreset.tables.map((tbl, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono">
                    <TableIcon className="w-4 h-4" />
                    <span>TABLE: {tbl.name}</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-white/5 text-slate-300 border-b border-white/10">
                        <tr>
                          {tbl.columns.map((col, cIdx) => (
                            <th key={cIdx} className="px-3 py-2 text-[11px] font-semibold text-cyan-400">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {tbl.sampleRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-white/[0.02]">
                            {row.map((val, vIdx) => (
                              <td key={vIdx} className="px-3 py-1.5 text-[11px]">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
              <Check className="w-4 h-4" /> Schema successfully applied & synced!
            </span>
          )}
          {!savedSuccess && <div />}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
