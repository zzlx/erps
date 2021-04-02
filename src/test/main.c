#include <stdio.h>
#include <syslog.h>

int main() {
	int log_test;
	openlog("log_test", LOG_PID, LOG_USER);
	syslog(LOG_INFO, "PID information, pid=%d\n", getpid());
	syslog(LOG_DEBUG, "debug message");
	closelog();
}
