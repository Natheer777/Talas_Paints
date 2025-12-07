import { VideoCard, VideoStatus } from '@/domian/entities/VideoCard';
import { IVideoCardRepository } from '@/domian/repository/IVideoCardRepository';
import { Pool } from 'pg';

export class VideoCardRepository implements IVideoCardRepository {
    constructor(private db: Pool) { }

    async create(videoCard: VideoCard): Promise<VideoCard> {
        const query = `
            INSERT INTO video_cards (
                id, title, video_url, status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            videoCard.id,
            videoCard.title,
            videoCard.videoUrl,
            videoCard.status,
            videoCard.createdAt,
            videoCard.updatedAt
        ];

        const result = await this.db.query(query, values);
        return this.mapToVideoCard(result.rows[0]);
    }

    async update(id: string, videoCard: Partial<VideoCard>): Promise<VideoCard | null> {
        // Build dynamic update query
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        if (videoCard.title !== undefined) {
            updateFields.push(`title = $${paramCounter++}`);
            values.push(videoCard.title);
        }

        if (videoCard.videoUrl !== undefined) {
            updateFields.push(`video_url = $${paramCounter++}`);
            values.push(videoCard.videoUrl);
        }

        if (videoCard.status !== undefined) {
            updateFields.push(`status = $${paramCounter++}`);
            values.push(videoCard.status);
        }

        // Always update the updated_at timestamp
        updateFields.push(`updated_at = $${paramCounter++}`);
        values.push(new Date());

        // Add the ID as the last parameter
        values.push(id);

        const query = `
            UPDATE video_cards
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING *
        `;

        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToVideoCard(result.rows[0]);
    }

    async delete(id: string): Promise<boolean> {
        const query = `DELETE FROM video_cards WHERE id = $1`;
        const result = await this.db.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async findById(id: string): Promise<VideoCard | null> {
        const query = `SELECT * FROM video_cards WHERE id = $1`;
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToVideoCard(result.rows[0]);
    }

    async findAll(): Promise<VideoCard[]> {
        const query = `SELECT * FROM video_cards ORDER BY created_at DESC`;
        const result = await this.db.query(query);
        return result.rows.map(row => this.mapToVideoCard(row));
    }

    async findByStatus(status: string): Promise<VideoCard[]> {
        const query = `SELECT * FROM video_cards WHERE status = $1 ORDER BY created_at DESC`;
        const result = await this.db.query(query, [status]);
        return result.rows.map(row => this.mapToVideoCard(row));
    }

    /**
     * Map database row to VideoCard entity
     * Following Single Responsibility Principle - this method only handles data mapping
     */
    private mapToVideoCard(row: any): VideoCard {
        return {
            id: row.id,
            title: row.title,
            videoUrl: row.video_url,
            status: row.status as VideoStatus,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}
