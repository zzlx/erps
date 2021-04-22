#include <stdio.h>
#include <syslog.h>
#include <limits.h>

int max(int x, int y)
{
    return x > y ? x : y;
}

int main() {
	/* 打印欢迎词 */
	printf("hello 欢迎你!\n");
	printf("int 存储大小 : %lu \n", sizeof(int));

	int (* p)(int, int) = & max; // &可以省略
	int a, b, c, d;

	printf("请输入三个数字:");
	scanf("%d %d %d", & a, & b, & c);

	/* 与直接调用函数等价，d = max(max(a, b), c) */
	d = p(p(a, b), c);

	printf("最大的数字是: %d\n", d);
	 printf("File :%s\n", __FILE__ );
   printf("Date :%s\n", __DATE__ );
   printf("Time :%s\n", __TIME__ );
   printf("Line :%d\n", __LINE__ );
   printf("ANSI :%d\n", __STDC__ );
	return 0;
}
