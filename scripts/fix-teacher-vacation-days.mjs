// Script para corrigir o campo vacationDaysRemaining para professores existentes
// Execute este script uma vez para inicializar o campo para todos os professores

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env.local
const envPath = join(__dirname, '../.env.local');
try {
  const envFile = readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=');
        // Remove aspas se existirem
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        envVars[key] = value;
      }
    }
  });
  
  // Definir as variáveis de ambiente
  Object.assign(process.env, envVars);
} catch (error) {
  console.error('Erro ao carregar .env.local:', error.message);
  process.exit(1);
}

// Inicializar Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fixTeacherVacationDays() {
  try {
    console.log('Iniciando correção dos dias de férias dos professores...');
    
    // Buscar todos os usuários com role 'teacher'
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'teacher')
      .get();
    
    if (usersSnapshot.empty) {
      console.log('Nenhum professor encontrado.');
      return;
    }
    
    console.log(`Encontrados ${usersSnapshot.size} professores.`);
    
    const batch = db.batch();
    let updatedCount = 0;
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      
      // Verificar se o campo vacationDaysRemaining já existe
      if (userData.vacationDaysRemaining === undefined || userData.vacationDaysRemaining === null) {
        console.log(`Atualizando professor: ${userData.name || 'Nome não disponível'} (ID: ${doc.id})`);
        
        // Adicionar o campo vacationDaysRemaining com valor padrão de 30
        batch.update(doc.ref, {
          vacationDaysRemaining: 30,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        updatedCount++;
      } else {
        console.log(`Professor ${userData.name || 'Nome não disponível'} já possui o campo vacationDaysRemaining: ${userData.vacationDaysRemaining}`);
      }
    });
    
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ Sucesso! ${updatedCount} professores foram atualizados com 30 dias de férias.`);
    } else {
      console.log('✅ Todos os professores já possuem o campo vacationDaysRemaining configurado.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir os dias de férias dos professores:', error);
  } finally {
    // Encerrar a aplicação
    process.exit(0);
  }
}

// Executar o script
fixTeacherVacationDays();