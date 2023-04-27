# 集合

### 1. 集合中主要有几种接口？

1. Collection接口是所有集合接口的父接口，定义了一些基本操作，比如添加，删除，迭代等
2. List接口继承了Colleciton接口，表示有序的元素集合，可以通过索引访问元素，运行重复元素
3. Set接口也是继承了Collection接口，表示不重复的集合，并且不保证元素的顺序
4. Map接口表示键值对的映射，每个键最多只能映射一个值
5. Queue接口表示一组元素的队列，通常按照先进先出的顺序访问元素

### 2. 集合中泛型的特点和好处？

1. 类型安全，因为在编译期时就会检查元素的类型，避免出现运行时这个类型转换的异常。
2. 代码重用，泛型可以极大的提高代码的重用性，因为同一种类型的集合可以被多个方法和类重复使用。
3. 性能优化，因为泛型可以避免类型的转换开销。

### 3. List、Set、Map、Queue的区别？

1. List存储的元素是有序的，并且允许有重复元素。
2. Set存储的元素是没有顺序的，并且不允许有重复元素。
3. Queue呢是表示一组元素的队列，他是按特定的排队规则确定先后顺序，存储的元素是有序的，并且可以重复。
4. Map是一组键值对的映射，其中的Key是不允许有重复元素的，value可以有重复元素，并且Map中的元素的无序的。

### 4. HashSet如何检查重复元素的？

首先当我们存入一个元素的时候，他会先去计算这个元素的hash值，然后根据这个hash值去找到这个要存储的位置，并且也会通过这个hash值与其他的元素的hash去比较，如果有相同的hash值，那么他将根据这个equals去判断这个元素中的内容是否也是一样的，如果一样，那么就不会添加到集合中，如果不一样就添加到集合中。

### 5. HashSet和TreeSet的区别？

1. 底层的数据结构，hashSet的底层是通过哈希表来存储元素的，而TreeSet的底层是红黑树。
2. 元素排序，hashSet因为是通过哈希表存储的的，所以元素是没有顺序的，而treeSet的底层是红黑树，所以TreeSet可以对元素进行排序。
3. 性能，因为哈希表无论是从查找还是添加元素来说，都是要比红黑树快的。
4. hashSet允许存储null元素，TreeSet不允许存储null元素

### 6. HashMap和HashSet的区别？

首先hashset的底层源码就是基于HashMap实现的，他们的底层都是通过哈希表来存储元素的。

### 7. HashMap和HashTable的区别？

首先他们都是实现了Map接口，区别呢第一个是线程安全问题，HashTable的线程是安全的，HashMap则不是，因为HashTable的方法呢，是同步的，所以可以在多线程环境下使用。第二个是HashTable不允许键值对为null，而HashMap的键值对可以为null，第三个是他们的扩容机制，HashTable的默认容量为11，HashMap的默认容量为16，并且HashMap如果存储的元素超过了16*0.75,那么就会自动扩容，而HashTable则不会自动扩容。

### 8. HashMap和TreeMap的区别？

1. 底层的数据结构，hashMap的底层是通过Hash表来存储的，TreeMap是通过红黑树存储的。
2. 元素排序，HashMap存储元素是不保证元素顺序的，而TreeMap可以通过key去排序。
3. 性能，Hash表的性能要比红黑树强。
4. HashMap允许键为null,而TreeMap不允许键为null。

### 9. ConcurrentHashMap和HashTable的区别？

他们最主要的区别就是实现锁的机制不同，ConcurrentHashMap使用的是分段锁机制，将一个Map分为好几个Segment，每个Segment都有独立的锁，不同的线程可以访问不同的Segment，而HsahTable在每个操作上都使用的同一个锁，因此在高并发环境下的性能是很差的。

### 10.ArrayList和linkedList的区别？

底层数据结构，ArrayList的底层是动态数组，而LinkedList是基于链表实现的，所以插入和删除的操作，LinkedList要比ArrayList的性能好，而查询访问的时候ArrayList的性能更好一点。

### 11.HashMap的底层原理？

jdk1.8之前，hashMap的底层是使用数组和链表。而1.8之后呢，为了解决这个哈系冲突呢，就采用了数组加链表转红黑树的操作。

### 12. HashMap的扩容机制？

hashMap的初始化数组大小是16，负载因子是0.75，当数组数据超过16*0.75的时候，那么就会扩大两倍。

### 13.Collection和Collections的区别？

Collection是集合类的顶级接口，而Collections是一个集合的工具类，它里面提供了集合的搜索，排序，线程安全化等等这些操作。

### 14. Array和ArrayList的区别

Array可以包含基本类型，和对象类型，而ArrayList只能包含对象类型，其次，数组的大小是固定的，而ArrayList的内部则是一个动态的数组，随着数据大小而变化的。

