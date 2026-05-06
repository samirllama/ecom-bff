import axios from 'axios';
import { logger } from '../utils/logger';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3004';

export class UserService {
    async getActiveUserCount(): Promise<number> {
        try {
            const response = await axios.get(`${USER_SERVICE_URL}/users/active-count`);
            return response.data.count;
        } catch (error) {
            logger.error('Error fetching active user count:', error);
            return 0;
        }
    }
}
