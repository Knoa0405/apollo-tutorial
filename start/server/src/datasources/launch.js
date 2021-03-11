const { RESTDataSource } = require('apollo-datasource-rest');
class LaunchAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://api.spacexdata.com/v2/';
    }

    async getAllLaunches() {
        // https://api.spacexdata.com/v2/launches => GET 요청
        const response = await this.get('launches');
        return Array.isArray(response)
            ? response.map(launch => this.launchReducer(launch))
            : [];
    }

    launchReducer(launch) {
        return {
            id: launch.flight_number || 0,
            cursor: `${launch.launch_date_unix}`,
            site: launch.launch_site && launch.launch_site.site_name,
            mission: {
                name: launch.mission_name,
                missionPatchSmall: launch.links.mission_patch_small,
                missionPatchLarge: launch.links.mission_patch,
            },
            rocket: {
                id: launch.rocket.rocket_id,
                name: launch.rocket.rocket_name,
                type: launch.rocket.rocket_type,
            },
        }
    }

    async getLaunchById({ launchId }) {
        const response = await this.get('launches', { flight_number : launchId })
        return this.launchReducer(response[0]);
    }

    getLaunchesByIds({ launchIds }) {
        return Promise.all(
            launchIds.map(launchId => this.getLaunchById({ launchId })),
        )
    }
}

// isBooked => field 의 경우, Space-X api가 여행이 예약된지 알지 못하기때문ㅇ
// SQLite DataBase 같은 다른 데이터 소스에 덧붙여야 한다.
// type Launch {
//     id: ID!
//     site: String
//     mission: Mission
//     rocket: Rocket
//     isBooked: Boolean!
//   }
module.exports = LaunchAPI;
