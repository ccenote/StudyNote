# SQL语法

## 一、基础

SQL 语句不区分大小写，但是数据库表名、列名和值是否区分依赖于具体的 DBMS 以及配置

SQL支持一下三种注释：

``` sql
## 注释
select * from mytable; -- 注释
/* 注释 */
```

数据库创建与使用：

``` sql
create database test;
use test;
```

## 二、创建表

``` sql
create table mytable(
	id INT not null auto_increment,
    col1 INT not null default 1,
    col2 VARCHAR(45) null,
    col3 DATE null,
    PRIMARY KEY ('id')
);
```

## 三、修改表

添加列

``` sql
alter table mytable add col4 char(20);
```

删除列

``` sql
alter table mytable drop column col4;
```

删除表

``` sql
drop table mytable;
```

## 四、插入

普通插入

``` sql
insert into mytable(col1,col2)
values(val1,val2);
```

插入检索出来的数据

``` sql
insert into mytable(col1,col2)
select col1,col2 from mytable2;
```

将一个表的内容插入到一个新表

``` sql
create table newtable as select * from mytable;
```

## 五、更新

``` sql
update mytable set col=val where id=1;
```

## 六、删除

``` sql
delete from mytable where id=1;
```

TRUNCATE TABLE可以清空表，也就是删除所有行

``` sql
truncate table mytable;
```

使用更新和删除操作一定要用where子句，不然会把整张表的数据都破坏。可以先用select语句进行测试，防止错误删除。

## 七、查询

DISTINCT 

去重，相同值只会出现一次，他作用于所有列

``` sql
select distinct * name from mytable where age=12;
```

LIMIT

限制返回的行数，可以有两个参数，第一个参数为起始行，从0开始，第二个参数为返回的总行数。

返回前5行

``` sql
select * from mytable limit 5;
```

``` sql
select * from mytable limit 0,5;
```

返回第45行

``` sql
select * from mytable limit 44,1
```

## 八、排序

- asc：升序（默认）
- desc：降序

可以按多个列进行排序，并且每个列指定不同的排序方式：

``` sql
select * from mytable order by name asc,age desc;
```

## 九、过滤

不进行过滤的数据非常大，导致通过网络传输了多余的数据，从而浪费了网络宽带。因此尽量使用SQL语句来过滤不必要的数据，而不是传输所有的数据到客户端中然后由客户端进行过滤。

``` sql
select * from mytable where col is null;
```

下面显示了where子句可用的操作符

| 操作符      | 说明         |
| ----------- | ------------ |
| =           | 等于         |
| <           | 小于         |
| >           | 大于         |
| <>!=        | 不等于       |
| <=!>        | 小于等于     |
| >=!<        | 大于等于     |
| between     | 在两个值之间 |
| is null     | 为null值     |
| is not null | 不为null值   |

应该注意到，NULL与0、空字符串都不同。

AND和or用于连接多个过滤条件，优先处理AND，当一个过滤表达式涉及到多个AND和OR时，可以使用`()`来决定优先级，使得优先级关系更清晰。

IN操作符用于匹配一个值，其他也可以借一个select子句，从而匹配子查询得到的一组值。

NOT操作符用于否定一个条件。

## 十、计算字段

在数据库服务器上完成数据的转换和格式化的工作往往比客户端上快得多，并且转换和格式化后的数据量更少的话可以减少网络通信量。

计算字段通常需要使用AS来取别名，否则输出的时候字段名为计算表达式。

``` sql
select col1,col2 as alias from mytable;
```

CONCAT()字段用于连接两个字段，许多数据库会使用空格把一个值填充为列宽，因此连接的结果会出现一些不必要的空格，使用TRIM()可以去除首尾空格。

``` sql
select concat(trim(col1),'(',trim(col2),')') as concat_col from mytable;
select * from mytable where name like concat('%',你好,'%');
```

## 十一、函数

各个DBMS的函数都是不相同的，因此不可移植，一下主要是MySQL的函数

### 汇总

| 函数    | 说明                           |
| ------- | ------------------------------ |
| AVG()   | 返回某列的平均值（忽略NULL行） |
| COUNT() | 返回某列的函数                 |
| MAX()   | 返回某列的最大值               |
| MIN()   | 返回某列的最小值               |
| SUM()   | 返回某列值之和                 |

使用DISTINCT可以汇总不同的值

``` sql
select avg(distinct col1) as avg_col from mytable;
```

### 文本处理

| 函数      | 说明           |
| --------- | -------------- |
| LEFT()    | 左边的字符     |
| RIGHT()   | 右边的字符     |
| LOWER()   | 转换为小写字符 |
| UPPER()   | 转换为大写字母 |
| LTRIM()   | 去除左边的空格 |
| RTRIM()   | 去除右边的空格 |
| LENGTH()  | 长度           |
| SOUNDEX() | 转换为语音值   |

其中，SOUNDEX()可以将一个字符串转换为描述其语音表示的字母数字模式

``` sql
select * from mytable where soundex(col1)=soundex('apple');
```

### 日期和时间处理

- 日期格式：`YYYY-MM-DD`
- 时间格式：`HH:<zero-width space>MM:SS`

| 函数          | 说明                           |
| ------------- | ------------------------------ |
| ADDDATE()     | 增加一个日期（天、周等）       |
| ADDTIME()     | 增加一个时间（时、分等）       |
| CURDATE()     | 返回当前日期                   |
| CURTIME()     | 返回当前时间                   |
| DATE()        | 返回日期时间的日期部分         |
| DATEDIFF()    | 计算两个日期之差               |
| DATE_ADD()    | 高度灵活的日期运算函数         |
| DATE_FORMAT() | 返回一个格式化的日期或时间串   |
| DAY()         | 返回一个日期的天数部分         |
| DAYOFWEEK()   | 对于一个日期，返回对应的星期几 |
| HOUR()        | 返回一个时间的小时部分         |
| MINUTE()      | 返回一个时间的分钟部分         |
| MONTH()       | 返回一个日期的月份部分         |
| NOW()         | 返回当前日期和时间             |
| SECOND()      | 返回一个时间的秒部分           |
| TIME()        | 返回一个日期时间的时间部分     |
| YEAR()        | 返回一个日期的年份部分         |

``` sql
select now();
```

``` html
2018-04-14 20:25:11
```

### 数值处理

| 函数   | 说明   |
| ------ | ------ |
| SIN()  | 正弦   |
| COS()  | 余弦   |
| TAN()  | 正切   |
| ABS()  | 绝对值 |
| SQRT() | 平方根 |
| MOD()  | 余数   |
| EXP()  | 指数   |
| PI()   | 圆周率 |
| RAND() | 随机数 |

## 十二、分组

把具有相同的数据值的行放在同一个组中

可以对同一个分组数据使用汇总函数进行处理，例如求分组数据的平均值等

指定的分组字段除了能按该字段进行分组，也会自动按该字段进行排序

``` sql
select col,count(*) as num from mytable group by col;
```

GROUP BY自动按分组字段进行排序，ORDER BY也可以按汇总字段来进行排序

``` sql
select col, count(*) as num from mytable group by col order by num desc;
```

WHERE过滤行，HAVING过滤分组，行过滤应当先于分组过滤

``` sql
select col,count(*) as num from mytable where col>2 group by col having num>=2;
```

分组规定：

- GROUP BY子句出现在WHERE子句后，ORDER BY子句之前
- 除了汇总字段外，SELECT语句中的每一个字段都必须在GROUP BY子句中给出
- NULL的行会单独分为一组
- 大多数SQL实现不支持GROUP BY列具有可变长度的数据类型

## 十三、子查询

子查询中只能返回一个字段的数据

可以将子查询的结果作为WHERE语句的过滤条件：

``` sql
select * from mytable1 where col1 in (select col2 from mytable2);
```

下面的语句可以检索出客户的订单数量，子查询语句会对第一个查询检索出的每个客户执行一次：

``` sql
select cust_name,(select count(*) from Orders where Orders.cust_id=Customers.cust_id) as orders_name from Customers order by cust_name;
```

## 十四、连接

连接用于连接多个表，使用JOIN关键字，并且条件语句使用ON而不是Where

连接可以替换子查询，并且比子查询的效率一般会更快

可以用AS给列名、计算字段和表名取别名，给表名取别名是为了简化SQL语句以及连接相同表

### 内连接

内连接又称等值连接，使用INNER JOIN关键字

``` sql
select A.value,B.value from tablea as A inner join tableb as B on A.key = B.key;
```

可以不明确使用INNER JOIN，而使用普通查询并在WHERE中将两个表中要连接的列用等值方法连接起来

``` sql
select A.value,B.value from tablea as A,tableb as B where A.key=B.key;
```

### 自连接

自连接可以看成内连接的一种，只是连接的表是自身而已

一张员工表，包含员工姓名和员工所属部门，要找出与jim处在统一部分的所有员工姓名

子查询版本：

``` sql
select name from employee where department=(select department from employee where name = 'jim');
```

内连接版本：

``` sql
select e1.name from employee as e1 inner join employee as e2 on e1.department=e2.department and e2.name='jim';
```

### 自然连接

自然连接是把同名列通过等值测试连接起来的，同名列可以有多个。

内连接和自然连接的区别：内连接提供连接的列，而自然连接自动连接所有同名列。

``` sql
select a.value,b.value from tablea as A inner join tableb as B;
```

### 外连接

外连接保留了没有关联的那些行。分为左外连接，右外连接以及全连接，左外连接就是保留左表没有关联的行。

检索所有顾客的订单信息，包括还没有订单信息的顾客。

``` sql
select Customers.cust_id,Customer.cust_name,Orders.order_id from Customers LEFT OUTER JOIN Orders on Customers.cust_id=Order.cust_id;
```

customers表：

| cust_id | cust_name |
| ------- | --------- |
| 1       | a         |
| 2       | b         |
| 3       | c         |

orders表：

| order_id | cust_id |
| -------- | ------- |
| 1        | 1       |
| 2        | 1       |
| 3        | 3       |
| 4        | 3       |

结果：

| cust_id | cust_name | order_id |
| ------- | --------- | -------- |
| 1       | a         | 1        |
| 1       | a         | 2        |
| 3       | c         | 3        |
| 3       | c         | 4        |
| 2       | b         | Null     |

## 十五、组合查询

使用UNION来组合两个查询，如果第一个查询返回M行，第二个查询返回N行，那么组合查询的结果一般为M+N行。

每个查询必须包含相同的列、表达式和聚集函数。

默认会去除相同行，如果需要保留相同行，使用UNION ALL。

只能包含一个ORDER BY子句，并且必须位于语句的最后。

``` sql
select col form mytable where col=1 union select col from mytable where col=2;
```

## 十六、事务管理

基本术语：

- 事务（transaction）指一组 SQL 语句；
- 回退（rollback）指撤销指定 SQL 语句的过程；
- 提交（commit）指将未存储的 SQL 语句结果写入数据库表；
- 保留点（savepoint）指事务处理中设置的临时占位符（placeholder），你可以对它发布回退（与回退整个事务处理不同）。

不能回退 SELECT 语句，回退 SELECT 语句也没意义；也不能回退 CREATE 和 DROP 语句。

MySQL 的事务提交默认是隐式提交，每执行一条语句就把这条语句当成一个事务然后进行提交。当出现 START TRANSACTION 语句时，会关闭隐式提交；当 COMMIT 或 ROLLBACK 语句执行后，事务会自动关闭，重新恢复隐式提交。

设置 autocommit 为 0 可以取消自动提交；autocommit 标记是针对每个连接而不是针对服务器的。

如果没有设置保留点，ROLLBACK 会回退到 START TRANSACTION 语句处；如果设置了保留点，并且在 ROLLBACK 中指定该保留点，则会回退到该保留点。

``` sql
start transaction

savepoint delete1

rollback to delete1

commit
```

