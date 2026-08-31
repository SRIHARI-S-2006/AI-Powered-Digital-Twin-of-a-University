import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

/**
 * Cascading department → section → students hook.
 *
 * Usage:
 *   const { deptOptions, sectionOptions, studentOptions } = useStudentCascade(deptId, section);
 *
 * - deptOptions: departments list for the first Select
 * - sectionOptions: distinct semester_section values from `timetable` for the chosen dept
 * - studentOptions: active students in the chosen dept, optionally narrowed by section
 */
export function useStudentCascade(deptId: string, section: string) {
  // 1. Departments (shared list, long cache)
  const { data: departments = [] } = useQuery({
    queryKey: ['departments-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('department_id, department_name')
        .order('department_name');
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 2. Sections: distinct semester_section values in the timetable for this department
  //    Only fires when a department is selected.
  const { data: rawSections = [] } = useQuery({
    queryKey: ['timetable-sections', deptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timetable')
        .select('semester_section')
        .eq('department_id', deptId)
        .not('semester_section', 'is', null);
      if (error) throw error;
      // Return sorted unique values
      const unique = [...new Set((data ?? []).map((r: any) => r.semester_section as string))].sort();
      return unique;
    },
    enabled: !!deptId,
    staleTime: 2 * 60 * 1000,
  });

  // 3. Students in the chosen department.
  //    If a section like "Co-2A" is chosen, extract the semester number from it (the digit
  //    after the dash, e.g. "Co-2A" → semester 2) and further filter by current_semester.
  const semester = section ? extractSemester(section) : null;

  const { data: students = [] } = useQuery({
    queryKey: ['students-cascade', deptId, semester],
    queryFn: async () => {
      let q = supabase
        .from('students')
        .select('student_id, full_name, roll_number, current_semester')
        .eq('department_id', deptId)
        .eq('status', 'active')
        .order('roll_number');
      if (semester) q = q.eq('current_semester', semester);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!deptId,
    staleTime: 2 * 60 * 1000,
  });

  const deptOptions = departments.map((d: any) => ({ value: d.department_id, label: d.department_name }));
  const sectionOptions = rawSections.map((s) => ({ value: s, label: s }));
  const studentOptions = students.map((s: any) => ({
    value: s.student_id,
    label: `${s.full_name} (${s.roll_number})`,
  }));

  return { deptOptions, sectionOptions, studentOptions };
}

/**
 * Extracts a semester number from a section code like "Co-2A" → 2, "CSE-3B" → 3.
 * Returns null if no digit is found.
 */
function extractSemester(section: string): number | null {
  const match = section.match(/[-_]?(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
