import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, BookOpen, CheckSquare, Award, Home, Bus, Star, Trophy, Coins, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatDate, getStatusColor } from '../../lib/utils';

function useStudentProfile(id: string) {
  return useQuery({
    queryKey: ['student-profile', id],
    queryFn: async () => {
      // Step 1: fetch student first so we have dept/batch for fee lookup.
      // Support lookups by both UUID student_id and string roll_number.
      let query = supabase.from('students').select('*');
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        query = query.eq('student_id', id);
      } else {
        query = query.eq('roll_number', id);
      }
      const studentRes = await query.single();
      if (studentRes.error) throw studentRes.error;
      const student = studentRes.data;
      const studentId = student.student_id;

      // Step 2: all related data in parallel using resolved studentId
      const [
        enrollmentsRes,
        attendanceRes,
        examsRes,
        hostelRes,
        transportRes,
        clubsRes,
        sportsRes,
        feeRes,
        financeRes,
      ] = await Promise.all([
        supabase.from('enrollments').select('*, courses(course_name, credits)').eq('student_id', studentId),
        supabase.from('attendance').select('status').eq('student_id', studentId),
        supabase.from('examinations').select('*, courses(course_name)').eq('student_id', studentId).order('exam_date', { ascending: false }),
        supabase.from('hostel_allocations').select('*, hostel_rooms(block, room_number)').eq('student_id', studentId).single(),
        supabase.from('transport_allocations').select('*, transport_routes(route_name, start_point, end_point)').eq('student_id', studentId).single(),
        supabase.from('club_memberships').select('*, clubs(club_name, category)').eq('student_id', studentId),
        supabase.from('sports_participation').select('*, sports_teams(sport_name, category)').eq('student_id', studentId),
        supabase.from('fee_structure').select('total_fee').eq('department_id', student.department_id ?? '').eq('batch_year', student.batch_year ?? 0).single(),
        supabase.from('finance_transactions').select('amount_paid').eq('student_id', studentId),
      ]);

      const attendance = attendanceRes.data ?? [];
      const present = attendance.filter((a) => a.status === 'Present').length;
      const attendancePct = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : null;

      const totalFee = feeRes.data?.total_fee ?? 0;
      const totalPaid = (financeRes.data ?? []).reduce((sum: number, t: any) => sum + (t.amount_paid ?? 0), 0);

      return {
        student,
        enrollments: enrollmentsRes.data ?? [],
        attendancePct,
        totalAttendance: attendance.length,
        exams: examsRes.data ?? [],
        hostel: hostelRes.data,
        transport: transportRes.data,
        clubs: clubsRes.data ?? [],
        sports: sportsRes.data ?? [],
        totalFee,
        totalPaid,
        outstanding: totalFee - totalPaid,
      };
    },
    enabled: !!id,
  });
}

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useStudentProfile(id!);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-40 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || !data?.student) {
    return (
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-8 text-center">
        <p className="text-lg font-semibold text-slate-700 mb-2">Student not found</p>
        <p className="text-sm text-red-500 mb-4">{(error as any)?.message ?? `No student with id "${id}" exists.`}</p>
        <button onClick={() => navigate('/students')} className="text-blue-600 text-sm underline">← Back to Students</button>
      </div>
    );
  }

  const s = data!.student;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" icon={<ArrowLeft size={15} />} onClick={() => navigate('/students')}>
          Back
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <User size={28} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{s.full_name}</h1>
            <p className="text-blue-200 text-sm">{s.roll_number} · {s.department}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              <span className="bg-white/15 rounded-lg px-3 py-1">Batch {s.batch_year}</span>
              <span className="bg-white/15 rounded-lg px-3 py-1">Semester {s.current_semester}</span>
              <Badge color={getStatusColor(s.status) as any} className="self-center">{s.status}</Badge>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-white/20">
          <div>
            <p className="text-blue-200 text-xs">Email</p>
            <p className="text-sm truncate">{s.email}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs">Phone</p>
            <p className="text-sm">{s.phone ?? '—'}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs">Admission Date</p>
            <p className="text-sm">{formatDate(s.admission_date)}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs">Gender</p>
            <p className="text-sm">{s.gender ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{data?.attendancePct != null ? `${data.attendancePct}%` : '—'}</p>
          <p className="text-xs text-slate-500 mt-1">Attendance</p>
          <p className="text-xs text-slate-400">{data?.totalAttendance} records</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{data?.enrollments.length ?? 0}</p>
          <p className="text-xs text-slate-500 mt-1">Enrolled Courses</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{data?.exams.length ?? 0}</p>
          <p className="text-xs text-slate-500 mt-1">Exams Taken</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
          <p className={`text-3xl font-bold ${(data?.outstanding ?? 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            ₹{((data?.outstanding ?? 0) / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-slate-500 mt-1">Outstanding Fee</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Enrollments */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Course Enrollments</h3>
          </div>
          {(data?.enrollments ?? []).length === 0
            ? <p className="text-sm text-slate-400">No enrollments found.</p>
            : (data?.enrollments ?? []).map((e: any) => (
              <div key={e.enrollment_id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{e.courses?.course_name ?? e.course_code}</p>
                  <p className="text-xs text-slate-400">{e.academic_term} · {e.courses?.credits ?? '?'} credits</p>
                </div>
                <Badge color={getStatusColor(e.status) as any}>{e.status}</Badge>
              </div>
            ))}
        </Card>

        {/* Exam Results */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-purple-600" />
            <h3 className="text-sm font-semibold text-slate-900">Exam Results</h3>
          </div>
          {(data?.exams ?? []).length === 0
            ? <p className="text-sm text-slate-400">No exam records found.</p>
            : (data?.exams ?? []).slice(0, 6).map((e: any) => (
              <div key={e.exam_id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{e.courses?.course_name ?? e.course_code}</p>
                  <p className="text-xs text-slate-400">{formatDate(e.exam_date)} · {e.exam_type}</p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-sm font-bold text-slate-700">{e.marks_obtained}/{e.max_marks}</span>
                  <Badge color={getStatusColor(e.result ?? '') as any}>{e.grade ?? '—'}</Badge>
                </div>
              </div>
            ))}
        </Card>

        {/* Hostel & Transport */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Home size={16} className="text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Accommodation</h3>
          </div>
          {data?.hostel ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Block</span>
                <span className="font-medium">{(data.hostel as any).hostel_rooms?.block ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Room</span>
                <span className="font-medium">{(data.hostel as any).hostel_rooms?.room_number ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <Badge color={getStatusColor((data.hostel as any).status) as any}>{(data.hostel as any).status}</Badge>
              </div>
            </div>
          ) : <p className="text-sm text-slate-400">No hostel allocation.</p>}

          <div className="mt-5 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2 mb-3">
              <Bus size={14} className="text-blue-600" />
              <h4 className="text-sm font-semibold text-slate-900">Transport</h4>
            </div>
            {data?.transport ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Route</span>
                  <span className="font-medium">{(data.transport as any).transport_routes?.route_name ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Point</span>
                  <span className="font-medium">{(data.transport as any).pickup_point ?? '—'}</span>
                </div>
              </div>
            ) : <p className="text-sm text-slate-400">No transport allocation.</p>}
          </div>
        </Card>

        {/* Clubs & Sports */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-amber-600" />
            <h3 className="text-sm font-semibold text-slate-900">Clubs & Activities</h3>
          </div>
          {(data?.clubs ?? []).length === 0
            ? <p className="text-sm text-slate-400 mb-3">Not a member of any club.</p>
            : (data?.clubs ?? []).map((c: any) => (
              <div key={c.membership_id} className="flex items-center justify-between py-1.5">
                <div>
                  <p className="text-sm font-medium">{c.clubs?.club_name}</p>
                  <p className="text-xs text-slate-400">{c.clubs?.category} · {c.role}</p>
                </div>
              </div>
            ))}

          <div className="mt-4 pt-3 border-t border-slate-50">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={14} className="text-emerald-600" />
              <h4 className="text-sm font-semibold">Sports</h4>
            </div>
            {(data?.sports ?? []).length === 0
              ? <p className="text-sm text-slate-400">No sports participation.</p>
              : (data?.sports ?? []).map((sp: any) => (
                <div key={sp.participation_id} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-sm font-medium">{sp.sports_teams?.sport_name}</p>
                    <p className="text-xs text-slate-400">{sp.position} · {sp.season}</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
