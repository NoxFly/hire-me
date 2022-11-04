import Enmap from 'enmap';

/**
 * TABLE CONNECTIONS
 * | token  | socket |
 * | string | string |
 */
export const connections = new Enmap({ name: 'connections' });
/**
 * TABLE ROLES
 * | token  |  role  |
 * | string | string |
 */
export const roles = new Enmap({ name: 'roles' });
/**
 * TABLE JOBS
 * |   id   | config |
 * | string |  Job   |
 */
export const jobs = new Enmap({ name: 'jobs' });
/**
 * TABLE APPLICATIONS
 * | token  |   rooms  |
 * | string | string[] |
 */
export const applications = new Enmap({ name: 'applications' });



export type MemberRole = 'recruiter' | 'applicant';

export interface Job {
	id: string,
	createdAt: number,
	ended: boolean,
    name: string,
	recruiter: string,
	applicants: string[],
    doneCount?: number
}