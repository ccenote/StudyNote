# 基础

### 1. Object类都有哪些方法？

1. clone()方法的用途是用来另存一个当前存在的对象。
2. getClass()方法的用途是获取运行时的类型，这个方法返回的是此Object对象的类对象，运行时类对象Class。
3. equals()方法是用来比较两个对象的内容是否相等，默认情况下equals和==是一样的，所以一般我们需要重写这个equals方法。
4. hashCode()方法用来返回这个对象的物理地址也就是哈希值。
5. toString()方法用来返回这个对象的字符串形式。
6. wait()方法用来导致当前线程等待，直到其他线程调用此对象的notify()方法或notifyAll()方法。
7. notify()方法用来唤醒在此对象上等待的单个线程。
8. notifyAll()方法用来唤醒在此对象上等待的所有线程。

### 2. 静态变量和实例变量的区别？

1. 静态变量不属于任何实例对象，它是属于类的，在初始化的时候，jvm只为静态变量分配一次内存空间。
2. 实例变量是属于实例对象的，所以，他会在每次创建对象的时候，都会分配一次成员变量的内存空间。

### 3. String类常用的方法有哪些？

1. indexOf()返回指定字符的索引
2. chatAt()返回指定索引处的字符
3. replace()字符串替换
4. trim()去除字符串两端的空格
5. split()根据一个支付来分割字符串，返回一个字符串数组
6. getBytes()返回字符串的byte类型的数组
7. length()返回字符串的长度
8. toLowerCase()将字符串转换为小写字母
9. toUpperCase()将字符串转换为大写字母
10. substring()字符串截取
11. equeal()比较字符串是否相等

### 4. 数组有没有length方法，String有没有length方法？

数组没有length方法，只有length属性，而String是有length方法的。

### 5. String、StringBuffer、StringBuilder的区别？

 String是字符串常量

StringBuffer和StringBuilder是字符串变量

其次StringBuffer是线程安全的，所以一般多线程操作大量数据的时候使用StringBuffer

单线程操作大量数据的时候使用StringBuilder

### 6. static和final关键字的区别？

static关键字用于修饰静态变量，静态方法和静态代码块，他们属于类级别的，在类加载时就会被初始化，不需要实例化对象就可以访问。而final关键字用于修饰常量，方法和类，他们属于实例级别或者类级别的，可以用于定义不可变的常量，防止方法被重写或者防止类被继承。



