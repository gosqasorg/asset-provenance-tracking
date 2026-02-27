import fs from 'node:fs'
import path from 'node:path'

// Load settings when testing

const envVarPath = path.resolve(__dirname, 'local.settings.json')
if(fs.existsSync(envVarPath)) {
  const values = JSON.parse(fs.readFileSync(envVarPath, 'utf8')).Values || {}

  for(const [k, v] of Object.entries(values)) {
    if(typeof v === 'string' && !(k in process.env)) process.env[k] = v
  }
}