import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateFengShui } from '../backend/utils/colorUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateColors() {
    console.log("Starting color migration...");
    const { data: colors, error: fetchError } = await supabase.from('colors').select('*');
    
    if (fetchError) {
        console.error('Error fetching colors:', fetchError);
        return;
    }

    console.log(`Found ${colors.length} colors. Updating elements...`);

    for (const color of colors) {
        const calculatedElement = calculateFengShui(color.hex);
        console.log(`Color: ${color.name} (${color.hex}) -> Calculated: ${calculatedElement}`);
        
        const { error: updateError } = await supabase
            .from('colors')
            .update({ element: calculatedElement })
            .eq('id', color.id);

        if (updateError) {
            console.error(`Error updating color ${color.id}:`, updateError);
        }
    }

    console.log("Migration completed!");
}

migrateColors();
