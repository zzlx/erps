


void main () {

}

void input_information(void) {
  for (int i = 0; i < N; i++) {
    printf("请输入学号 年龄 名字");
    scanf("%d%d%s", &students[i].id,&students[i].age,&(students[i].name[0]));
  }
}

void input_score(void) {
  for (int i = 0; i < N; i++) {
    printf("请录入语文 数学 英语成绩");
    scanf("%d%d%s", &students[i].chinese,&students[i].math,&students[i].english);
  }
}

void find_student(void) {
  int idnumber = 0;
  printf("请输入要查询的ID号");
  scanf("%d", &idnumber);
  for (int i = 0; i < N; i++) {
    if (idnumber == students[i].id) {
      printf("该学生的ID=%d\n年龄=%d\n",students[i].id,students[i].age);
      printf(
        "该学生的语文成绩=%d\n数学成绩=%d\n英语成绩=%d\n",
        students[i].chinese,
        students[i].math,
        students[i].english
      );
      printf("这名同学叫%s\n", (&students[i].name[0]));
      break;
    }
  }
}

void delete_students(void) {
  int idnumber = 0;
  printf("请输入要删除的学生ID号");
  scanf("%d", &idnumber);
  for (int i = 0; i < N; i++) {
    if (idnumber == students[i].id) {
      students[i].id = 0;
      students[i].age = 0;
      students[i].chinese = 0;
      students[i].math = 0;
      students[i].english = 0;
      for (int n = 0; n < 20; n++) {
        students[i].name[n] = "\0";
      }
      printf("ID为%d学生信息已经清除完毕\n", students[i].id);
      break;
    }
  }
}

void change_student(void) {
  int idnumber = 0;
  printf("请输入要修改的学生ID号");
  scanf("%d", &idnumber);
  for (int i = 0; i < N; i++) {
    if (idnumber == students[i].id) {
      printf("请顺序填写修改内容，学号 年龄 名字 语文成绩 数学成绩 英语成绩");
      scanf(
        "%d%d%s%d%d%d",
        &students[i].id,
        &students[i].age,
        &(students[i].name[0]),
        &students[i].chinese,
        &students[i].math,
        &students[i].english,
      );
      printf("\nID为%d学生信息修改完毕\n", students[i].id);
      break;
    }
  }
}
