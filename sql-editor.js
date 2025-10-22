const { Client } = require('pg');
const readline = require('readline');
require('dotenv').config();

// Supabase connection configuration
const connectionConfig = {
  host: 'db.cnjdmddqwfryvqnhirkb.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  // You'll need to get your database password from Supabase dashboard
  password: process.env.SUPABASE_DB_PASSWORD || 'your-database-password-here',
  ssl: {
    rejectUnauthorized: false
  }
};

class SQLEditor {
  constructor() {
    this.client = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async connect() {
    try {
      this.client = new Client(connectionConfig);
      await this.client.connect();
      console.log('✅ Connected to Supabase PostgreSQL database!');
      console.log('📊 Ready to execute SQL queries...\n');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('\n💡 To fix this:');
      console.log('1. Get your database password from Supabase Dashboard > Settings > Database');
      console.log('2. Set SUPABASE_DB_PASSWORD in your .env file');
      console.log('3. Or update the password in this script');
      return false;
    }
  }

  async executeQuery(sql) {
    if (!this.client) {
      console.log('❌ Not connected to database');
      return;
    }

    try {
      const result = await this.client.query(sql);
      
      if (result.rows.length === 0) {
        console.log('✅ Query executed successfully (no rows returned)');
        if (result.rowCount !== null) {
          console.log(`📊 Affected rows: ${result.rowCount}`);
        }
      } else {
        console.log('✅ Query executed successfully:');
        console.table(result.rows);
        console.log(`📊 Rows returned: ${result.rows.length}`);
      }
    } catch (error) {
      console.error('❌ Query error:', error.message);
    }
  }

  showHelp() {
    console.log(`
🔧 SQL Editor Commands:
  .help          - Show this help
  .tables        - List all tables
  .desc <table>  - Describe table structure
  .users         - Show users table sample
  .quit          - Exit the editor
  
📝 Or enter any SQL query (end with semicolon)
Examples:
  SELECT * FROM users LIMIT 5;
  SELECT COUNT(*) FROM tracer_study_responses;
  SELECT * FROM gallery_albums WHERE is_published = true;
`);
  }

  async handleCommand(input) {
    const command = input.trim().toLowerCase();
    
    switch (command) {
      case '.help':
        this.showHelp();
        break;
        
      case '.tables':
        await this.executeQuery(`
          SELECT table_name, table_type 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name;
        `);
        break;
        
      case '.users':
        await this.executeQuery('SELECT id, email, created_at FROM auth.users LIMIT 5;');
        break;
        
      case '.quit':
        return false;
        
      default:
        if (command.startsWith('.desc ')) {
          const tableName = command.substring(6).trim();
          await this.executeQuery(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '${tableName}'
            ORDER BY ordinal_position;
          `);
        } else if (input.trim()) {
          await this.executeQuery(input);
        }
        break;
    }
    
    return true;
  }

  async start() {
    console.log('🚀 CCS Alumni Portal - SQL Editor');
    console.log('==================================\n');
    
    const connected = await this.connect();
    if (!connected) {
      this.rl.close();
      return;
    }

    this.showHelp();
    
    const promptUser = () => {
      this.rl.question('SQL> ', async (input) => {
        const shouldContinue = await this.handleCommand(input);
        if (shouldContinue) {
          promptUser();
        } else {
          console.log('👋 Goodbye!');
          if (this.client) {
            await this.client.end();
          }
          this.rl.close();
        }
      });
    };
    
    promptUser();
  }
}

// Start the SQL editor
if (require.main === module) {
  const editor = new SQLEditor();
  editor.start().catch(console.error);
}

module.exports = SQLEditor;