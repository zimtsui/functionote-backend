import { App } from './app';
import Database = require('better-sqlite3');

const db = new Database('./functionote.db', { fileMustExist: true });
const app = new App(db);
app.listen('3000');
