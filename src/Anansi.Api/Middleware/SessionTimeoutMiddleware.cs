namespace Anansi.Api.Middleware;

public class SessionTimeoutMiddleware
{
    private readonly RequestDelegate _next;
    private readonly TimeSpan _timeout;

    public SessionTimeoutMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        var minutes = int.TryParse(configuration["Session:TimeoutMinutes"], out var m) ? m : 30;
        _timeout = TimeSpan.FromMinutes(minutes);
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var lastActivity = context.Session.GetString("LastActivity");
            if (lastActivity != null)
            {
                var lastActivityTime = DateTime.Parse(lastActivity);
                if (DateTime.UtcNow - lastActivityTime > _timeout)
                {
                    context.Session.Clear();
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new { error = "Session has expired due to inactivity." });
                    return;
                }
            }

            context.Session.SetString("LastActivity", DateTime.UtcNow.ToString("O"));
        }

        await _next(context);
    }
}
