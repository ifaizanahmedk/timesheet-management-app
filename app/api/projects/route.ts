import { NextResponse } from 'next/server';
import type { Project } from '@/types';

const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'Project Alpha' },
  { id: 'proj-2', name: 'Project Beta' },
  { id: 'proj-3', name: 'Project Gamma' },
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: MOCK_PROJECTS,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
