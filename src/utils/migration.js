// Migration utility to move data from localStorage to Supabase
import * as localStorage from './storage';
import * as api from './supabaseApi';

export const migrateToSupabase = async () => {
    try {
        console.log('Starting migration to Supabase...');
        
        // Get all data from localStorage
        const users = localStorage.getUsers();
        const societies = localStorage.getSocieties();
        const visitors = localStorage.getVisitors();
        const notices = localStorage.getNotices();
        const preApprovals = localStorage.getPreApprovals();

        // Migrate societies first (they're referenced by other data)
        console.log(`Migrating ${societies.length} societies...`);
        for (const society of societies) {
            try {
                await api.addSociety(society);
            } catch (error) {
                console.error(`Error migrating society ${society.id}:`, error);
            }
        }

        // Migrate users
        console.log(`Migrating ${users.length} users...`);
        for (const user of users) {
            try {
                await api.addUser(user);
            } catch (error) {
                console.error(`Error migrating user ${user.id}:`, error);
            }
        }

        // Migrate visitors
        console.log(`Migrating ${visitors.length} visitors...`);
        for (const visitor of visitors) {
            try {
                await api.addVisitor(visitor);
            } catch (error) {
                console.error(`Error migrating visitor ${visitor.id}:`, error);
            }
        }

        // Migrate notices
        console.log(`Migrating ${notices.length} notices...`);
        for (const notice of notices) {
            try {
                await api.addNotice(notice);
            } catch (error) {
                console.error(`Error migrating notice ${notice.id}:`, error);
            }
        }

        // Migrate pre-approvals
        console.log(`Migrating ${preApprovals.length} pre-approvals...`);
        for (const preApproval of preApprovals) {
            try {
                await api.addPreApproval(preApproval);
            } catch (error) {
                console.error(`Error migrating pre-approval ${preApproval.id}:`, error);
            }
        }

        console.log('Migration completed successfully!');
        return { success: true, message: 'Migration completed successfully' };
    } catch (error) {
        console.error('Migration error:', error);
        return { success: false, message: error.message };
    }
};


