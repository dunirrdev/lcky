// LCKY Members - Carregado automaticamente do Google Sheets
// Não edite este arquivo manualmente!

let members = [];

async function loadMembers() {
    try {
        // ⚠️ SUBSTITUA ESTE LINK PELO SEU LINK DO GOOGLE SHEETS CSV
        const sheetUrl = 'https://docs.google.com/spreadsheets/d/SEU_ID_DA_PLANILHA/export?format=csv&gid=0';
        
        const response = await fetch(sheetUrl);
        const csvText = await response.text();
        
        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        members = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            // Parse linha CSV (considerando vírgulas dentro de aspas)
            const values = parseCSVLine(lines[i]);
            
            if (values.length >= headers.length) {
                const member = {};
                headers.forEach((header, index) => {
                    let value = values[index] ? values[index].trim().replace(/"/g, '') : '';
                    
                    // Converter números
                    if (['power', 'unitsKilled', 'unitsDead', 'unitsHealed', 'merits', 'luckyPoints'].includes(header)) {
                        value = parseInt(value) || 0;
                    }
                    
                    member[header] = value;
                });
                
                // Adicionar badges padrão
                if (!member.badges) {
                    member.badges = [{ id: "welcomed", name: "Welcomed", icon: "🏆" }];
                }
                
                members.push(member);
            }
        }
        
        console.log('✅ Members loaded:', members.length);
        
        // Disparar evento quando carregar
        window.dispatchEvent(new CustomEvent('membersLoaded'));
        
    } catch (error) {
        console.error('❌ Error loading members:', error);
    }
}

// Parser CSV simples
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Carregar membros automaticamente
loadMembers();
