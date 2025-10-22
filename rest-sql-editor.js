const https = require('https');
const readline = require('readline');
require('dotenv').config();

// Supabase REST API configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://cnjdmddqwfryvqnhirkb.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuamRtZGRxd2ZyeXZxbmhpcmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQzNjgsImV4cCI6MjA3NTA2MDM2OH0.NuThtXWP29FEvWYNMme4ipSLiBHOPhco7EoFMJlPfG8';

class RestSQLEditor {
  constructor() {
    this.baseUrl = SUPABASE_URL;
    this.headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method,
        headers: this.headers
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ status: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', reject);
      
      if (data && method !== 'GET') {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async listTables() {
    try {
      const response = await this.makeRequest('/rest/v1/');
      if (response.status === 200 && response.data.definitions) {
        const tables = Object.keys(response.data.definitions);
        console.log('📊 Available Tables:');
        tables.forEach(table => console.log(`  - ${table}`));
        console.log(`\n✅ Found ${tables.length} tables\n`);
      } else {
        console.log('❌ Could not retrieve table list');
      }
    } catch (error) {
      console.error('❌ Error listing tables:', error.message);
    }
  }

  async queryTable(tableName, options = {}) {
    try {
      let path = `/rest/v1/${tableName}`;
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit);
      if (options.select) params.append('select', options.select);
      if (options.order) params.append('order', options.order);
      if (options.filter) {
        // Add filters (format: column=eq.value)
        Object.entries(options.filter).forEach(([key, value]) => {
          params.append(key, `eq.${value}`);
        });
      }
      
      if (params.toString()) {
        path += '?' + params.toString();
      }

      const response = await this.makeRequest(path);
      
      if (response.status === 200) {
        if (Array.isArray(response.data)) {
          if (response.data.length === 0) {
            console.log('✅ Query successful (no rows found)');
          } else {
            console.log('✅ Query successful:');
            console.table(response.data);
            console.log(`📊 Rows returned: ${response.data.length}`);
          }
        } else {
          console.log('✅ Response:', response.data);
        }
      } else {
        console.log(`❌ Query failed (${response.status}):`, response.data);
      }
    } catch (error) {
      console.error('❌ Query error:', error.message);
    }
  }

  async insertData(tableName, data) {
    try {
      const response = await this.makeRequest(`/rest/v1/${tableName}`, 'POST', data);
      
      if (response.status === 201) {
        console.log('✅ Data inserted successfully');
        console.table(response.data);
      } else {
        console.log(`❌ Insert failed (${response.status}):`, response.data);
      }
    } catch (error) {
      console.error('❌ Insert error:', error.message);
    }
  }

  showHelp() {
    console.log(`
🔧 REST SQL Editor Commands:
  .help                     - Show this help
  .tables                   - List all tables
  .select <table>           - Select all from table (limit 10)
  .select <table> <limit>   - Select with custom limit
  .count <table>            - Count rows in table
  .insert <table> <json>    - Insert data (JSON format)
  .quit                     - Exit the editor

📝 Quick Commands for Your Alumni Portal:
  .users                    - Show auth users
  .responses                - Show tracer study responses  
  .albums                   - Show gallery albums

💡 Examples:
  .select users 5
  .count tracer_study_responses
  .select gallery_albums
`);
  }

  parseCommand(input) {
    const parts = input.trim().split(/\s+/);
    return {
      command: parts[0],
      args: parts.slice(1)
    };
  }

  async handleCommand(input) {
    const { command, args } = this.parseCommand(input);
    
    switch (command.toLowerCase()) {
      case '.help':
        this.showHelp();
        break;
        
      case '.tables':
        await this.listTables();
        break;
        
      case '.select':
        if (args.length === 0) {
          console.log('❌ Usage: .select <table> [limit]');
        } else {
          const tableName = args[0];
          const limit = args[1] || '10';
          await this.queryTable(tableName, { limit });
        }
        break;

      case '.count':
        if (args.length === 0) {
          console.log('❌ Usage: .count <table>');
        } else {
          const tableName = args[0];
          await this.queryTable(tableName, { select: 'count' });
        }
        break;

      case '.users':
        await this.queryTable('users', { limit: '5', select: 'id,email,created_at' });
        break;

      case '.responses':
        await this.queryTable('tracer_study_responses', { limit: '5' });
        break;

      case '.albums':
        await this.queryTable('gallery_albums', { limit: '10' });
        break;

      case '.insert':
        if (args.length < 2) {
          console.log('❌ Usage: .insert <table> <json_data>');
          console.log('Example: .insert users {"name": "John", "email": "john@example.com"}');
        } else {
          try {
            const tableName = args[0];
            const jsonData = JSON.parse(args.slice(1).join(' '));
            await this.insertData(tableName, jsonData);
          } catch (e) {
            console.log('❌ Invalid JSON format');
          }
        }
        break;
        
      case '.quit':
        return false;
        
      default:
        if (input.trim()) {
          console.log('❌ Unknown command. Type .help for available commands.');
        }
        break;
    }
    
    return true;
  }

  async start() {
    console.log('🚀 CCS Alumni Portal - REST SQL Editor');
    console.log('=====================================\n');
    console.log('✅ Using Supabase REST API');
    console.log(`📡 Connected to: ${this.baseUrl}\n`);

    this.showHelp();
    
    const promptUser = () => {
      this.rl.question('REST> ', async (input) => {
        const shouldContinue = await this.handleCommand(input);
        if (shouldContinue) {
          promptUser();
        } else {
          console.log('👋 Goodbye!');
          this.rl.close();
        }
      });
    };
    
    promptUser();
  }
}

// Start the REST SQL editor
if (require.main === module) {
  const editor = new RestSQLEditor();
  editor.start().catch(console.error);
}

module.exports = RestSQLEditor;