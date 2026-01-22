// Image Storage Fix Utility
// This script helps diagnose and fix image storage issues

import { supabase } from './src/config/supabase.js';

class ImageStorageFixer {
    constructor() {
        this.issues = [];
        this.fixes = [];
    }

    // 1. Check if Supabase is properly configured
    async checkSupabaseConnection() {
        console.log('🔍 Checking Supabase connection...');
        
        try {
            const { data, error } = await supabase.from('visitors').select('count').limit(1);
            
            if (error) {
                this.issues.push(`Supabase connection failed: ${error.message}`);
                return false;
            }
            
            console.log('✅ Supabase connection successful');
            return true;
        } catch (err) {
            this.issues.push(`Supabase connection error: ${err.message}`);
            return false;
        }
    }

    // 2. Verify visitors table schema
    async checkVisitorsTableSchema() {
        console.log('🔍 Checking visitors table schema...');
        
        try {
            const { data, error } = await supabase.from('visitors').select('*').limit(1);
            
            if (error) {
                this.issues.push(`Schema check failed: ${error.message}`);
                return null;
            }
            
            const columns = data.length > 0 ? Object.keys(data[0]) : [];
            console.log('📋 Available columns:', columns);
            
            // Check for required columns
            const requiredColumns = ['id', 'name', 'photo', 'societyid', 'residentid', 'status'];
            const missingColumns = requiredColumns.filter(col => !columns.includes(col));
            
            if (missingColumns.length > 0) {
                this.issues.push(`Missing columns: ${missingColumns.join(', ')}`);
                this.fixes.push(`Run: ALTER TABLE visitors ADD COLUMN ${missingColumns.map(col => `${col} text`).join(', ADD COLUMN ')};`);
            }
            
            if (columns.includes('photo')) {
                console.log('✅ Photo column exists');
            } else {
                console.log('❌ Photo column missing');
                this.issues.push('Photo column does not exist in visitors table');
                this.fixes.push('Run: ALTER TABLE visitors ADD COLUMN photo text;');
            }
            
            return columns;
        } catch (err) {
            this.issues.push(`Schema check error: ${err.message}`);
            return null;
        }
    }

    // 3. Test image storage with a small test image
    async testImageStorage() {
        console.log('🔍 Testing image storage...');
        
        // Create a minimal test image (10x10 red square)
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 10, 10);
        const testImage = canvas.toDataURL('image/jpeg', 0.8);
        
        console.log(`📸 Test image size: ${testImage.length} characters`);
        
        const testVisitor = {
            id: `test_${Date.now()}`,
            name: 'Image Test Visitor',
            photo: testImage,
            societyid: 'test_society',
            residentid: 'test_resident',
            status: 'pending',
            entrytime: new Date().toISOString()
        };
        
        try {
            const { data, error } = await supabase
                .from('visitors')
                .insert(testVisitor)
                .select()
                .single();
            
            if (error) {
                this.issues.push(`Image storage test failed: ${error.message}`);
                
                if (error.message.includes('payload too large')) {
                    this.fixes.push('Images are too large. Implement image compression before storage.');
                } else if (error.message.includes('column "photo" does not exist')) {
                    this.fixes.push('Add photo column: ALTER TABLE visitors ADD COLUMN photo text;');
                }
                
                return null;
            }
            
            console.log('✅ Image storage test successful');
            
            // Clean up test data
            await supabase.from('visitors').delete().eq('id', testVisitor.id);
            
            return data;
        } catch (err) {
            this.issues.push(`Image storage test error: ${err.message}`);
            return null;
        }
    }

    // 4. Check existing visitors for image data
    async checkExistingVisitorImages() {
        console.log('🔍 Checking existing visitor images...');
        
        try {
            const { data, error } = await supabase
                .from('visitors')
                .select('id, name, photo')
                .not('photo', 'is', null)
                .limit(10);
            
            if (error) {
                this.issues.push(`Failed to check existing images: ${error.message}`);
                return;
            }
            
            console.log(`📊 Found ${data.length} visitors with photos`);
            
            let validImages = 0;
            let invalidImages = 0;
            
            data.forEach(visitor => {
                if (visitor.photo && visitor.photo.startsWith('data:image/')) {
                    validImages++;
                } else {
                    invalidImages++;
                    console.log(`❌ Invalid image data for visitor ${visitor.name} (${visitor.id})`);
                }
            });
            
            console.log(`✅ Valid images: ${validImages}`);
            console.log(`❌ Invalid images: ${invalidImages}`);
            
            if (invalidImages > 0) {
                this.issues.push(`${invalidImages} visitors have invalid image data`);
                this.fixes.push('Clean up invalid image data or re-capture photos for affected visitors');
            }
            
        } catch (err) {
            this.issues.push(`Error checking existing images: ${err.message}`);
        }
    }

    // 5. Test image retrieval and display
    async testImageRetrieval() {
        console.log('🔍 Testing image retrieval...');
        
        try {
            const { data, error } = await supabase
                .from('visitors')
                .select('id, name, photo')
                .not('photo', 'is', null)
                .limit(1)
                .single();
            
            if (error || !data) {
                console.log('ℹ️ No visitors with photos found for retrieval test');
                return;
            }
            
            if (data.photo && data.photo.startsWith('data:image/')) {
                console.log('✅ Image retrieval successful');
                console.log(`📸 Retrieved image size: ${data.photo.length} characters`);
                
                // Test if image can be loaded in browser
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        console.log('✅ Image can be displayed in browser');
                        resolve(true);
                    };
                    img.onerror = () => {
                        console.log('❌ Image cannot be displayed in browser');
                        this.issues.push('Retrieved images cannot be displayed');
                        resolve(false);
                    };
                    img.src = data.photo;
                });
            } else {
                this.issues.push('Retrieved image data is not in valid format');
                return false;
            }
            
        } catch (err) {
            this.issues.push(`Image retrieval test error: ${err.message}`);
            return false;
        }
    }

    // 6. Generate comprehensive report
    async generateReport() {
        console.log('\n🔧 RUNNING COMPREHENSIVE IMAGE STORAGE DIAGNOSTICS...\n');
        
        const connectionOk = await this.checkSupabaseConnection();
        if (!connectionOk) {
            console.log('\n❌ Cannot proceed - Supabase connection failed');
            return this.printReport();
        }
        
        await this.checkVisitorsTableSchema();
        await this.testImageStorage();
        await this.checkExistingVisitorImages();
        await this.testImageRetrieval();
        
        return this.printReport();
    }

    // Print final report
    printReport() {
        console.log('\n📋 DIAGNOSTIC REPORT');
        console.log('='.repeat(50));
        
        if (this.issues.length === 0) {
            console.log('✅ No issues found! Image storage should be working correctly.');
        } else {
            console.log(`❌ Found ${this.issues.length} issue(s):`);
            this.issues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue}`);
            });
        }
        
        if (this.fixes.length > 0) {
            console.log('\n🔧 RECOMMENDED FIXES:');
            this.fixes.forEach((fix, index) => {
                console.log(`${index + 1}. ${fix}`);
            });
        }
        
        console.log('\n' + '='.repeat(50));
        
        return {
            issues: this.issues,
            fixes: this.fixes,
            hasIssues: this.issues.length > 0
        };
    }
}

// Export for use
export default ImageStorageFixer;

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
    window.ImageStorageFixer = ImageStorageFixer;
    console.log('Image Storage Fixer loaded. Run: new ImageStorageFixer().generateReport()');
}