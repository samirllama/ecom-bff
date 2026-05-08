import axios from 'axios';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3004';

export class UserService {
    async getActiveUserCount(): Promise<number> {
        const response = await axios.get<{ count: number }>(
            `${USER_SERVICE_URL}/users/active-count`
        );
        return response.data.count;
    }
}
