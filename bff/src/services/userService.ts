export class UserService {
    async getActiveUserCount(): Promise<number> {
        // In a real app this would call a User microservice.
        // Returning a mock value for demo.
        return 128;
    }
}
