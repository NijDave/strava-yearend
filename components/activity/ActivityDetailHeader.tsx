"use client";

interface ActivityDetailHeaderProps {
    activity: any;
}

const activityIcons: Record<string, string> = {
    Run: "🏃",
    Ride: "🚴",
    Walk: "🚶",
    Hike: "🥾",
    Swim: "🏊",
    Workout: "💪",
    default: "🏃",
};

const activityColors: Record<string, string> = {
    Run: "from-orange-500 to-red-500",
    Ride: "from-blue-500 to-cyan-500",
    Walk: "from-green-500 to-emerald-500",
    Hike: "from-amber-500 to-yellow-500",
    Swim: "from-blue-600 to-indigo-600",
    Workout: "from-purple-500 to-pink-500",
    default: "from-gray-500 to-gray-700",
};

export function ActivityDetailHeader({ activity }: ActivityDetailHeaderProps) {
    const icon = activityIcons[activity.type] || activityIcons.default;
    const gradient = activityColors[activity.type] || activityColors.default;

    const date = new Date(activity.start_date);
    const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className={`relative bg-gradient-to-r ${gradient} text-white overflow-hidden`}>
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="animate-slide-down">
                    {/* Activity Type Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                        <span className="text-2xl">{icon}</span>
                        <span className="font-semibold text-sm uppercase tracking-wide">{activity.type}</span>
                    </div>

                    {/* Activity Name */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 animate-slide-up stagger-1">
                        {activity.name}
                    </h1>

                    {/* Date and Time */}
                    <div className="flex flex-wrap items-center gap-4 text-white/90 animate-slide-up stagger-2">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{formattedTime}</span>
                        </div>
                        {activity.location_city && (
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-medium">{activity.location_city}</span>
                            </div>
                        )}
                    </div>

                    {/* View on Strava Button */}
                    <div className="mt-6 animate-slide-up stagger-3">
                        <a
                            href={`https://www.strava.com/activities/${activity.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-smooth hover-lift shadow-lg"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                            </svg>
                            View on Strava
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                    <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb" />
                </svg>
            </div>
        </div>
    );
}
