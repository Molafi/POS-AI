import fs from 'fs';
import path from 'path';
import { getDbPath } from '../database';

export interface BackupResult {
  success: boolean;
  filePath?: string;
  error?: string;
  timestamp: string;
}

function getBackupDir(): string {
  const defaultDir = path.join(process.cwd(), 'backups');
  return process.env.BACKUP_DIR || defaultDir;
}

export async function createBackup(customDir?: string): Promise<BackupResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  try {
    const dbPath = getDbPath();
    const backupDir = customDir || getBackupDir();

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFileName = `apex-pos-backup-${timestamp}.db`;
    const backupPath = path.join(backupDir, backupFileName);

    // Copy database file
    if (!fs.existsSync(dbPath)) {
      return {
        success: false,
        error: 'Database file not found',
        timestamp,
      };
    }

    fs.copyFileSync(dbPath, backupPath);

    console.log(`Database backup created: ${backupPath}`);

    return {
      success: true,
      filePath: backupPath,
      timestamp,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Backup failed';
    console.error('Backup failed:', message);
    return {
      success: false,
      error: message,
      timestamp,
    };
  }
}

export function listBackups(customDir?: string): string[] {
  const backupDir = customDir || getBackupDir();

  if (!fs.existsSync(backupDir)) {
    return [];
  }

  return fs
    .readdirSync(backupDir)
    .filter((file) => file.startsWith('apex-pos-backup-') && file.endsWith('.db'))
    .sort()
    .reverse();
}

export function deleteOldBackups(keepCount: number = 10, customDir?: string): number {
  const backupDir = customDir || getBackupDir();
  const backups = listBackups(backupDir);

  if (backups.length <= keepCount) {
    return 0;
  }

  const toDelete = backups.slice(keepCount);
  let deleted = 0;

  for (const file of toDelete) {
    try {
      fs.unlinkSync(path.join(backupDir, file));
      deleted++;
    } catch (error) {
      console.error(`Failed to delete backup ${file}:`, error);
    }
  }

  return deleted;
}
