export interface PythonKata {
  id: string;
  name: string;
  section: string;
  usage: string;
  code?: string;
  testCode?: string;
  solution?: string;
  description?: string;
  difficulty?: string;
}

export const sampleKatasPython: PythonKata[] = [
  {
    id: "00_introduction/01_max_value",
    name: "Max Value",
    section: "00_introduction",
    usage: `Finding the maximum value in a collection is one of the most fundamental operations in computing, underpinning everything from database query optimization (SQL's MAX aggregate) to real-time monitoring systems that track peak CPU usage, memory consumption, or network throughput. Cloud platforms like AWS CloudWatch and Datadog continuously compute max values across time-series metrics to trigger autoscaling decisions and alerting thresholds. In machine learning pipelines at companies like Google and Meta, max operations appear in softmax activation functions, feature normalization, and argmax for classification output selection. The pattern also surfaces in competitive programming and interview screens as a warm-up to verify that candidates understand iteration, comparison, and edge cases like empty collections or negative numbers. Despite its simplicity, implementing it correctly requires handling edge cases that reflect real production concerns: what happens with an empty dataset, mixed types, or floating-point infinities.`,
  },
  {
    id: "00_introduction/02_longest_word",
    name: "Longest Word",
    section: "00_introduction",
    usage: `Finding the longest string in a collection maps directly to text processing pipelines used in search engines, natural language processing, and content management systems. At companies like Elasticsearch (used by Wikipedia, GitHub, and Netflix), tokenization stages need to identify the longest tokens for indexing strategies, query expansion, and field length normalization that affects relevance scoring. In UI development, computing the longest string determines column widths in data tables, truncation thresholds, and responsive layout calculations; frameworks like React Table and AG Grid perform these measurements to render performant, well-formatted grids. Content moderation systems at social media companies use string length analysis as part of spam detection heuristics, since abnormally long words or messages are a signal for abuse. This problem tests a candidate's ability to combine iteration with comparison logic while tracking state, a pattern that generalizes to any "find the best element by some metric" scenario.`,
  },
  {
    id: "00_introduction/03_is_prime",
    name: "Is Prime",
    section: "00_introduction",
    usage: `Primality testing is the mathematical backbone of modern cryptography. The RSA algorithm, which secures virtually all HTTPS traffic on the internet, depends on generating large prime numbers (typically 2048 to 4096 bits) and relies on the computational asymmetry that testing primality is fast while factoring the product of two large primes is infeasible. Libraries like OpenSSL and services like AWS KMS use probabilistic primality tests such as Miller-Rabin during key generation for TLS certificates, SSH keys, and digital signatures. Beyond cryptography, prime numbers are used in hash table sizing (many hash map implementations use prime-sized arrays to reduce collision clustering), pseudo-random number generators, and error-correcting codes like Reed-Solomon used in QR codes and satellite communications. In interviews, primality testing evaluates a candidate's grasp of trial division optimization (checking only up to the square root, skipping even numbers), which demonstrates algorithmic thinking about reducing unnecessary computation.`,
  },
  {
    id: "00_introduction/04_fizz_buzz",
    name: "Fizz Buzz",
    section: "00_introduction",
    usage: `FizzBuzz became the most famous coding interview screening question after Imran Ghory proposed it in 2007 and Jeff Atwood popularized it on his blog, noting that a surprising percentage of computer science graduates could not solve it. Companies including Microsoft and Facebook have used variations of it as an initial filter in their hiring pipelines to verify that candidates can translate basic logic into working code. Beyond interviews, the underlying pattern of modular arithmetic and conditional branching appears throughout production systems: scheduling tasks that run every Nth cycle, round-robin load balancing across server pools, implementing clock dividers in embedded systems, and cycling through UI themes or color palettes. The problem also serves as a pedagogical tool for exploring software design principles; Tom Dalling's famous "FizzBuzz in Too Much Detail" essay uses it to demonstrate concepts like the Open-Closed Principle, Strategy Pattern, and polymorphism. Its simplicity makes it an ideal testbed for exploring language features, code golf, and even hardware description languages.`,
  },
  {
    id: "py_two_sum",
    name: "Two Sum",
    section: "01_hashing",
    difficulty: "medium",
    description: "Given a list of integers and a target value, return a tuple of indices (i, j) where nums[i] + nums[j] == target. Each input has exactly one solution; don't reuse the same element.\n\nExample:\n  two_sum([2, 7, 11, 15], 9) -> (0, 1)\n  two_sum([3, 2, 4], 6) -> (1, 2)",
    code: `# Given a list of integers and a target,
# return a tuple of indices of the two numbers that add up to target.
# Each input has exactly one solution; don't reuse the same element.

def two_sum(nums, target):
    pass
`,
    testCode: `def test_basic_case():
    assert_equal(two_sum([2, 7, 11, 15], 9), (0, 1))

def test_middle_elements():
    assert_equal(two_sum([3, 2, 4], 6), (1, 2))

def test_negative_numbers():
    assert_equal(two_sum([-1, -2, -3, -4, -5], -8), (2, 4))

def test_first_and_last():
    assert_equal(two_sum([1, 5, 3, 7], 8), (0, 3))
`,
    solution: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return (seen[complement], i)
        seen[n] = i
`,
    usage: `The two-sum / pair-sum pattern using a hash map is arguably the single most important algorithmic pattern for coding interviews, consistently appearing as the first problem on LeetCode and a staple at companies like Google, Amazon, and Meta. It demonstrates the critical technique of trading space for time by reducing an O(n^2) brute-force search to O(n) with a hash-based lookup, a principle that underlies countless production optimizations. In financial systems, the same pattern powers transaction reconciliation, where you need to find complementary debits and credits that sum to a target; payment processors like Stripe and Square use similar matching logic at scale. E-commerce recommendation engines use pair-matching to find complementary products, and fraud detection systems identify suspicious transaction pairs that sum to known thresholds. The pattern generalizes to k-sum problems and forms the foundation for understanding hash-based data structures, which are among the most performance-critical components in systems like Redis, Memcached, and Python's own dict implementation.`,
  },
  {
    id: "02_beginner_recursion/01_sum_numbers_recursive",
    name: "Sum Numbers Recursive",
    section: "02_beginner_recursion",
    usage: `Recursive accumulation is a foundational pattern that appears throughout distributed computing and data processing frameworks. MapReduce, the paradigm behind Hadoop and used extensively at Google for processing petabytes of web data, is fundamentally a recursive decomposition: split data, process sub-problems, and combine (accumulate) results. Apache Spark's reduce and fold operations follow the same recursive accumulation logic across distributed partitions. In compilers and interpreters, recursive evaluation of arithmetic expressions in abstract syntax trees uses exactly this pattern, with each node accumulating values from its children. Accounting and financial reporting systems recursively sum values across hierarchical organizational structures, rolling up department budgets into division totals and ultimately company-wide figures. Understanding recursive accumulation is essential for grasping tail-call optimization, which languages like Scheme guarantee and which Python deliberately omits, making it important for candidates to discuss stack depth limits and iterative alternatives in interviews.`,
  },
  {
    id: "02_beginner_recursion/02_factorial",
    name: "Factorial",
    section: "02_beginner_recursion",
    usage: `The factorial function is the canonical example of recursion in computer science education and has direct applications in combinatorics, probability, and statistical computing. Permutation and combination calculations, which rely on factorials, are used in recommendation systems at Netflix and Spotify to compute the number of possible playlist orderings or content arrangements. In scientific computing, factorial appears in Taylor series expansions used by numerical libraries like NumPy and SciPy for computing trigonometric functions, exponentials, and probability distributions (the Poisson and binomial distributions both involve factorials). Cryptographic systems use factorial-scale computations when analyzing the keyspace of permutation-based ciphers. In interviews, factorial serves as a gateway to discussing recursion versus iteration trade-offs, memoization, stack overflow risks (Python's default recursion limit is 1000), and arbitrary-precision arithmetic since factorials grow extremely fast. The Stirling approximation and log-factorial techniques used in production statistical software demonstrate how theoretical CS concepts translate to practical numerical stability.`,
  },
  {
    id: "02_beginner_recursion/03_sum_of_lengths",
    name: "Sum Of Lengths",
    section: "02_beginner_recursion",
    usage: `Recursive list processing, where you decompose a collection and accumulate a derived metric from each element, is the conceptual basis for functional programming's map-reduce paradigm. This pattern appears in document processing pipelines at companies like Google (computing total character counts across search index segments), Grammarly (aggregating text metrics across paragraphs), and content delivery networks that calculate total payload sizes for bandwidth optimization. In compiler design, recursive traversal of token lists to compute aggregate properties like total symbol table size or expression complexity scores uses this exact decomposition. The pattern is also central to data validation frameworks where you recursively process a list of form fields, accumulating validation results, a pattern used in libraries like Marshmallow, Pydantic, and Django REST Framework serializers. This problem teaches candidates to think about recursive structure over heterogeneous data, combining element-level transformation (getting a length) with collection-level aggregation (summing), which is the essence of the map-reduce mental model.`,
  },
  {
    id: "02_beginner_recursion/04_reverse_string_recursive",
    name: "Reverse String Recursive",
    section: "02_beginner_recursion",
    usage: `Recursive string reversal teaches a decomposition strategy that extends to reversing any sequential data structure, a pattern used in text editors for undo history, network protocol debugging where packet payloads need byte-order reversal, and encoding schemes like Base64 and URL encoding that require transformation and reconstruction of character sequences. In natural language processing systems at companies like OpenAI and Google Translate, reverse operations on token sequences support bidirectional models (like BERT's masked language modeling) and right-to-left language rendering for Arabic and Hebrew text. Data serialization formats sometimes require endianness conversion, which is conceptually a reversal operation on byte sequences, critical in systems programming for cross-platform compatibility (x86 little-endian versus network big-endian byte order). In interviews, this problem tests whether candidates understand how recursion builds up results on the call stack and can articulate the O(n) stack space cost, leading to discussions about tail recursion, iterative alternatives using two-pointer swaps, and Python's slice syntax for idiomatic reversal.`,
  },
  {
    id: "02_beginner_recursion/05_palindrome_recursive",
    name: "Palindrome Recursive",
    section: "02_beginner_recursion",
    usage: `Palindrome detection has significant applications in bioinformatics, where palindromic DNA sequences are recognition sites for restriction enzymes, a fundamental concept in genetic engineering and CRISPR gene editing. Tools like EMBOSS palindrome finder are used in genomics research to locate inverted repeat sequences that form secondary structures in DNA, and research has linked palindromic sequences to chromosomal instability in cancer genomes. Beyond biology, palindrome checking is used in data validation for identifiers like VINs, ISBNs, and certain checksums that have palindromic properties. In competitive programming and technical interviews at companies like Google and Amazon, palindrome problems form an entire problem family, including longest palindromic substring (Manacher's algorithm), palindrome partitioning, and palindromic linked lists. The recursive approach specifically tests a candidate's ability to define shrinking sub-problems with two-pointer convergence, a pattern that generalizes to many divide-and-conquer string algorithms.`,
  },
  {
    id: "02_beginner_recursion/06_fibonacci",
    name: "Fibonacci",
    section: "02_beginner_recursion",
    usage: `The Fibonacci sequence is one of the most important problems in computer science education because it concretely demonstrates the difference between naive recursion (O(2^n) exponential time), memoized recursion (O(n) with caching), and iterative bottom-up dynamic programming (O(n) time, O(1) space). This progression is the exact mental framework needed to solve dynamic programming problems at companies like Google, Meta, and Jane Street, where DP appears in resource allocation, scheduling, and financial modeling. In financial markets, Fibonacci retracement levels (23.6%, 38.2%, 61.8%) derived from ratios of consecutive Fibonacci numbers are standard technical analysis tools used by traders at firms like Citadel and Two Sigma to identify support and resistance levels. The Fibonacci heap data structure, used in Dijkstra's shortest path algorithm implementations, achieves optimal amortized time complexity and is used in network routing protocols. In agile software development, Fibonacci numbers (1, 2, 3, 5, 8, 13) are the standard scale for story point estimation, used daily by engineering teams worldwide in tools like Jira and Linear.`,
  },
  {
    id: "03_linked_list_i/01_linked_list_values",
    name: "Linked List Values",
    section: "03_linked_list_i",
    usage: `Traversing a linked list and collecting its values into an array is the fundamental operation for bridging pointer-based and array-based data representations, a conversion that happens constantly in production systems. Operating systems maintain linked lists of processes (the process control block chain in Linux's task scheduler), free memory blocks (the kernel's free list allocator), and open file descriptors; debugging tools and monitoring agents traverse these lists to collect snapshots into arrays for display. In web development, ORMs like Django's QuerySet and SQLAlchemy's result proxies internally use linked or chained structures that get materialized into lists when you call list() or iterate. Garbage collectors in languages like Java (G1 GC) and Go traverse linked structures of heap objects to build reachability sets. This problem tests the most basic linked list operation and is a prerequisite for every other linked list problem, making it a common warm-up in interviews at companies that emphasize data structure fundamentals.`,
  },
  {
    id: "03_linked_list_i/02_sum_list",
    name: "Sum List",
    section: "03_linked_list_i",
    usage: `Summing values across a linked list is a traversal-with-accumulation pattern used in financial ledger systems where transactions are stored as linked records and running totals must be computed. Blockchain implementations, including Bitcoin and Ethereum clients, traverse chains of blocks (each pointing to the previous) to compute aggregate metrics like total transaction volume, cumulative gas fees, or chain difficulty. In embedded systems with constrained memory, sensor readings are often stored in linked lists and periodically summed for reporting to a central system, as seen in IoT platforms like Arduino sensor networks and industrial SCADA systems. Operating systems sum linked lists of memory allocation records to calculate total memory usage per process. This problem reinforces the traversal pattern while adding accumulation logic, and in interviews it provides a natural setup for follow-up questions about recursive versus iterative approaches and handling edge cases like empty lists or integer overflow.`,
  },
  {
    id: "03_linked_list_i/03_linked_list_find",
    name: "Linked List Find",
    section: "03_linked_list_i",
    usage: `Searching for a value in a linked list is the linear search analog for pointer-based structures, and it models how systems locate specific records in chains of data. In operating systems, the kernel searches linked lists of registered device drivers, interrupt handlers, and network sockets to dispatch operations to the correct handler; Linux's netfilter subsystem traverses chains of firewall rules to find matching packet filter entries. Symbol table lookups in interpreters for languages like Python and Ruby involve searching through chained hash buckets implemented as linked lists (separate chaining). Memory allocators search free lists to find blocks that satisfy allocation requests, using strategies like first-fit, best-fit, or next-fit. In interviews, this problem tests basic traversal with an early-exit condition (returning as soon as the target is found), which leads to discussions about average-case versus worst-case performance and why linked lists sacrifice O(1) random access for O(1) insertion and deletion.`,
  },
  {
    id: "03_linked_list_i/04_get_node_value",
    name: "Get Node Value",
    section: "03_linked_list_i",
    usage: `Accessing a linked list node by index highlights the fundamental trade-off between linked lists and arrays: arrays provide O(1) random access while linked lists require O(n) traversal. This distinction is critical in systems design interviews at companies like Google and Amazon, where candidates must justify choosing one data structure over another based on access patterns. In practice, index-based access into linked structures appears in pagination implementations ("get the 50th through 60th items"), skip lists used in databases like Redis for sorted set operations, and media playlists where users jump to a specific track number. The LRU (Least Recently Used) cache, a staple of system design interviews and used in CPU caches, database buffer pools, and CDN edge servers like Cloudflare's, combines a hash map with a linked list where positional access determines eviction order. This problem teaches candidates to handle boundary conditions like out-of-bounds indices, which maps directly to defensive programming practices in production API development.`,
  },
  {
    id: "03_linked_list_i/05_reverse_list",
    name: "Reverse List",
    section: "03_linked_list_i",
    usage: `Reversing a linked list is one of the most frequently asked interview questions at major tech companies, appearing regularly at Google, Meta, Amazon, and Microsoft. The in-place reversal technique using three pointers (prev, curr, next) with O(1) space is a foundational skill because the same pointer manipulation pattern recurs in problems like reversing sublists, detecting cycles (Floyd's algorithm), and reordering lists. In production systems, undo functionality in text editors like VS Code and Sublime Text relies on reversing action histories stored as linked structures. Network protocol stacks reverse linked lists of packet fragments for reassembly, and compilers reverse intermediate representation chains during optimization passes like dead code elimination. The iterative reversal is preferred in production over recursion because it avoids stack overflow on long lists; Python's default recursion limit of 1000 makes recursive reversal impractical for lists exceeding that length. Mastering this problem signals to interviewers that a candidate can manipulate pointers precisely without losing references, a skill that separates competent engineers from beginners.`,
  },
  {
    id: "03_linked_list_i/06_zipper_lists",
    name: "Zipper Lists",
    section: "03_linked_list_i",
    usage: `Interleaving two linked lists (the zipper pattern) is a pointer-manipulation exercise that models real-world data merging scenarios where alternating between sources is required. Audio and video processing systems interleave samples from multiple channels: stereo audio alternates left and right channel samples, and multiplexed video streams (used in broadcasting systems at companies like Netflix and YouTube) interleave frames from different quality levels for adaptive bitrate streaming. In concurrent programming, round-robin scheduling interleaves tasks from multiple queues, a pattern used in thread schedulers across operating systems and in Go's goroutine scheduler. Database systems interleave records from multiple sorted runs during external merge sort operations. Network switches use interleaving to implement fair queuing algorithms (like Weighted Fair Queuing used in Cisco routers) that prevent any single flow from monopolizing bandwidth. This problem tests precise pointer management under the added complexity of two simultaneous traversals, making it a strong signal for engineering competence in interviews.`,
  },
  {
    id: "03_linked_list_i/07_merge_lists",
    name: "Merge Lists",
    section: "03_linked_list_i",
    usage: `Merging two sorted linked lists is a core subroutine of merge sort and one of the most practically important linked list operations in systems programming. Database engines like PostgreSQL and MySQL use merge operations extensively during sort-merge joins, where sorted index scans from two tables are merged to produce join results. The generalized version, merge-k-sorted-lists, is fundamental to external sorting algorithms used when datasets exceed available RAM; systems like Hadoop's MapReduce shuffle phase merge sorted partitions from multiple mappers. Search engines merge sorted posting lists (document ID lists for each search term) during query execution to find documents matching multiple terms, a core operation in Lucene/Elasticsearch. In interviews at companies like Google, Amazon, and Bloomberg, this problem appears frequently both as a standalone question and as a building block for merge sort on linked lists. The two-pointer merge technique with a dummy head node is a pattern that candidates should be able to write flawlessly, as it demonstrates clean pointer management and handling of unequal-length inputs.`,
  },
  {
    id: "03_linked_list_i/08_is_univalue_list",
    name: "Is Univalue List",
    section: "03_linked_list_i",
    usage: `Checking whether all nodes in a linked list share the same value is a uniformity validation pattern that appears in data integrity checks across distributed systems. In database replication, consistency verification involves checking that all replicas of a record hold identical values; tools like pt-table-checksum for MySQL traverse rows to validate uniformity across primary and replica databases. Network configuration management systems like Ansible and Puppet verify that all nodes in a cluster have the same configuration value (same software version, same TLS certificate, same feature flag state). In manufacturing and quality control systems, sensor readings from a production line are checked for uniformity to detect equipment malfunction. The pattern also appears in image processing, where checking if all pixels in a region share the same color is part of flood-fill algorithms used in tools like Photoshop's paint bucket. In interviews, this problem tests traversal with an invariant check and early termination, reinforcing clean loop logic and edge case handling for single-node or empty lists.`,
  },
  {
    id: "03_linked_list_i/09_longest_streak",
    name: "Longest Streak",
    section: "03_linked_list_i",
    usage: `Finding the longest consecutive run of the same value in a linked list is a run-length analysis pattern used in data compression, signal processing, and monitoring systems. Run-length encoding (RLE), one of the simplest lossless compression algorithms, identifies and encodes consecutive runs of identical values; it is used in fax machines (ITU T.4 standard), BMP and TIFF image formats, and as a preprocessing step in more sophisticated codecs. In systems monitoring at companies like Datadog and Splunk, detecting the longest streak of identical metric values (like consecutive error codes or identical status responses) triggers anomaly detection alerts. Network analysis tools identify longest streaks of packet loss or identical routing decisions to diagnose connectivity issues. In bioinformatics, finding longest homopolymer runs (consecutive identical nucleotides) in DNA sequences is important for sequencing accuracy, particularly in Oxford Nanopore and PacBio long-read sequencing technologies. This problem combines traversal with streak tracking using two variables (current streak and max streak), testing a candidate's ability to maintain and update state during iteration.`,
  },
  {
    id: "03_linked_list_i/10_remove_node",
    name: "Remove Node",
    section: "03_linked_list_i",
    usage: `Removing a node by value from a linked list is a fundamental operation that models deletion in any sequential, pointer-based data structure. Operating systems remove entries from linked lists of processes (when a process terminates), file descriptors (when a file is closed), and network connections (when a socket is shut down); Linux kernel code contains thousands of list_del operations on its intrusive linked list implementation. In web applications, removing items from an order, a shopping cart, or a playlist involves finding and unlinking a node from a chain, a pattern seen in e-commerce systems at Amazon and Shopify. Memory allocators remove blocks from the free list when they are allocated to a program and reinsert them when freed. The key challenge is handling the special case where the target is the head node, which requires updating the head pointer itself; many candidates fail this edge case in interviews. This problem also naturally leads to discussions about sentinel/dummy nodes, which eliminate the head-deletion special case and are a standard production technique used in the Linux kernel's list implementation.`,
  },
  {
    id: "03_linked_list_i/11_insert_node",
    name: "Insert Node",
    section: "03_linked_list_i",
    usage: `Inserting a node at a specific position in a linked list is a core operation underlying dynamic data structures used throughout systems programming. Text editors implement insert operations on linked lists of characters or lines; the piece table data structure used in VS Code represents text as a linked chain of pieces where insertions create new nodes without copying the entire document. In operating systems, new processes are inserted into scheduling queues at specific priority positions, and interrupt handlers are inserted into handler chains at designated priority levels. Database B-tree implementations insert new keys into linked leaf-node chains to maintain sorted order for range queries. Memory allocators insert freed blocks back into the free list at the correct position to maintain address-ordered or size-ordered organization. In interviews, this problem tests precise index tracking during traversal and correct pointer rewiring, including edge cases for insertion at position 0 (new head) and at the end of the list, which together verify a candidate's thoroughness in handling boundary conditions.`,
  },
  {
    id: "04_binary_tree_i/01_depth_first_values",
    name: "Depth First Values",
    section: "04_binary_tree_i",
    usage: `Depth-first traversal is foundational to how software systems navigate hierarchical data. File systems like ext4 and NTFS use DFS to recursively walk directory trees for operations like calculating folder sizes, searching for files, and performing deletions. React's reconciliation engine traverses the virtual DOM tree depth-first to diff old and new component trees and determine minimal UI updates. Compilers use DFS-based traversals (preorder, inorder, postorder) on abstract syntax trees for code generation, type checking, and optimization passes. Git internally uses DFS to walk commit DAGs when computing merge bases and reachability. This pattern appears constantly in interviews at companies like Google, Meta, and Amazon, often as the entry point to more complex tree problems.`,
  },
  {
    id: "04_binary_tree_i/02_breadth_first_values",
    name: "Breadth First Values",
    section: "04_binary_tree_i",
    usage: `Breadth-first traversal is the backbone of level-by-level tree processing, used extensively in systems that need to process nodes by proximity or depth. Web crawlers at Google and Bing use BFS to systematically discover pages by following links layer by layer, ensuring broad coverage before deep dives. Network broadcast protocols use BFS to propagate packets to all nodes in a network, ensuring data reaches every endpoint. In game development, BFS drives AI pathfinding for NPC navigation in titles built on engines like Unity and Unreal. LinkedIn's People You May Know feature uses BFS-style exploration of the social graph to surface 2nd and 3rd-degree connections. This is a top-tier interview question at FAANG companies because it tests queue-based thinking and level-aware processing.`,
  },
  {
    id: "04_binary_tree_i/03_tree_sum",
    name: "Tree Sum",
    section: "04_binary_tree_i",
    usage: `Summing all values in a tree is a pattern that maps directly to aggregation over hierarchical structures. Database query planners compute aggregate statistics by summing values across B-tree index nodes when executing queries like SELECT SUM(column). Financial systems roll up revenue figures from leaf departments through divisional subtrees to produce company-wide totals. In distributed systems, metrics aggregation frameworks like Prometheus use tree-like hierarchies where child metrics are summed to produce parent-level dashboards. Webpack and other bundlers traverse dependency trees to sum up total bundle sizes for build analysis. While simple in isolation, tree sum is a building block for more complex tree DP problems and tests whether candidates can cleanly handle recursive accumulation, making it a common warm-up in technical interviews.`,
  },
  {
    id: "04_binary_tree_i/04_tree_includes",
    name: "Tree Includes",
    section: "04_binary_tree_i",
    usage: `Searching for a value in a tree is one of the most fundamental operations in computer science, underpinning everything from database lookups to DOM element queries. B-tree search in MySQL's InnoDB and PostgreSQL's indexes follows exactly this pattern, traversing tree nodes to locate rows matching a query predicate. The browser's document.querySelector walks the DOM tree to find elements matching a CSS selector. In-memory caches like Redis use tree-based data structures (skip lists, which share search properties with balanced trees) to locate keys. Symbol resolution in compilers and IDEs searches scope trees to find variable and function declarations. Interviewers use this problem to verify that candidates understand both recursive and iterative tree search and can articulate the O(n) worst case for unbalanced trees versus O(log n) for balanced ones.`,
  },
  {
    id: "04_binary_tree_i/05_tree_min_value",
    name: "Tree Min Value",
    section: "04_binary_tree_i",
    usage: `Finding the minimum value in a tree has direct applications in priority-based systems and database engines. In a binary search tree, the minimum is always the leftmost node, a property exploited by database indexes to quickly answer MIN() queries on indexed columns. Priority queues implemented as binary heaps find the minimum element in O(1), powering task schedulers in operating systems like Linux's CFS (Completely Fair Scheduler). Real-time monitoring systems traverse metric trees to find anomalous minimum readings across sensor hierarchies. In game AI, minimax algorithms search game trees to find the minimum score an opponent can force, which is core to chess engines like Stockfish. This problem tests whether candidates can handle both BST-optimized and general tree cases, and it appears frequently in interviews at companies that build database or infrastructure software.`,
  },
  {
    id: "04_binary_tree_i/06_max_root_to_leaf_path_sum",
    name: "Max Root To Leaf Path Sum",
    section: "04_binary_tree_i",
    usage: `Maximum root-to-leaf path sum directly mirrors how decision trees compute predictions in machine learning. In scikit-learn and XGBoost, inference on a decision tree follows a single root-to-leaf path, accumulating split criteria that produce a final prediction score. Boosted tree ensembles used by companies like Airbnb for pricing and Uber for ETA prediction rely on summing path values across hundreds of trees. In network routing, finding the maximum-bandwidth path through a tree topology requires evaluating path sums. Financial risk models use tree structures where path sums represent cumulative risk scores from root conditions to leaf outcomes. This problem is a staple in coding interviews because it combines tree traversal with optimization and tests whether candidates can correctly identify leaf nodes and propagate values upward.`,
  },
  {
    id: "04_binary_tree_i/07_tree_path_finder",
    name: "Tree Path Finder",
    section: "04_binary_tree_i",
    usage: `Finding a path to a target node in a tree is essential for navigation, debugging, and tracing systems. File managers display breadcrumb paths like /usr/local/bin by finding the path from the filesystem root to the current directory node. Browser DevTools highlight the DOM path to a selected element (html > body > div > span) using exactly this traversal. In version control, git log --ancestry-path finds the commit path between two points in the DAG. Error tracing in distributed systems like Jaeger reconstructs the call path from a root span to a failing leaf span in a trace tree. This is a common interview problem at companies like Google and Microsoft because it requires backtracking logic and tests whether candidates can construct and return paths rather than just boolean results.`,
  },
  {
    id: "04_binary_tree_i/08_tree_value_count",
    name: "Tree Value Count",
    section: "04_binary_tree_i",
    usage: `Counting occurrences of a value in a tree is a pattern used in text processing, analytics, and indexing systems. Search engines maintain inverted indexes where term frequency across document trees affects ranking in algorithms like TF-IDF and BM25, which power Google and Elasticsearch. Static analysis tools count occurrences of specific AST node types (function calls, variable references) to detect code smells or compute complexity metrics. In XML and JSON processing, XPath's count() function traverses document trees to count matching nodes. Log analysis pipelines aggregate error code occurrences across hierarchical service trees to identify systemic issues. This problem tests recursive counting with conditional logic and appears in interviews as a warm-up or as part of larger tree analysis questions.`,
  },
  {
    id: "04_binary_tree_i/09_how_high",
    name: "How High",
    section: "04_binary_tree_i",
    usage: `Tree height calculation is critical for maintaining performance guarantees in self-balancing tree data structures. AVL trees (used in database indexing) and red-black trees (used in C++ STL's std::map, Java's TreeMap, and the Linux kernel's process scheduler) compute subtree heights to trigger rotations that keep the tree balanced, ensuring O(log n) operations. PostgreSQL and MySQL use B-tree height to estimate query costs during plan optimization; a B-tree with height 3-4 can index billions of rows. In networking, spanning tree protocols compute tree heights to set bridge priorities and prevent broadcast storms. React Fiber's work loop considers tree depth when prioritizing rendering work. This is a foundational interview question because it tests recursive thinking and understanding of how height affects algorithmic complexity.`,
  },
  {
    id: "04_binary_tree_i/10_bottom_right_value",
    name: "Bottom Right Value",
    section: "04_binary_tree_i",
    usage: `Finding the bottom-right value in a tree, meaning the rightmost node at the deepest level, is a BFS pattern used in systems that need to identify boundary or extremal elements in hierarchical structures. In UI layout engines like those in browsers (Blink, WebKit) and mobile frameworks (Flutter), the last element at the deepest nesting level determines overflow behavior and scroll boundaries. Org chart applications need to find the most deeply nested employee or the last person added at the lowest level for reporting. In game development, scene graphs processed level-by-level need to identify the last renderable node at the deepest layer for z-ordering. This problem specifically tests BFS with level tracking and is a favorite in interviews because it verifies that candidates understand how to use a queue to process tree levels and extract position-specific nodes.`,
  },
  {
    id: "04_binary_tree_i/11_all_tree_paths",
    name: "All Tree Paths",
    section: "04_binary_tree_i",
    usage: `Enumerating all root-to-leaf paths in a tree is fundamental to decision tree interpretability, test coverage analysis, and configuration validation. In machine learning, tools like SHAP and LIME enumerate decision paths through tree models to explain individual predictions, a requirement in regulated industries like finance and healthcare. Test generation tools enumerate all execution paths through control flow trees to achieve path coverage. Network configuration validators enumerate all routes from a root switch to leaf devices to verify that every endpoint is reachable. In e-commerce, category trees at companies like Amazon enumerate all navigation paths to ensure every product is discoverable. This problem tests backtracking and path accumulation, and interviewers use it to assess whether candidates can correctly manage mutable path state during recursion.`,
  },
  {
    id: "04_binary_tree_i/12_tree_levels",
    name: "Tree Levels",
    section: "04_binary_tree_i",
    usage: `Grouping tree values by level is a BFS pattern with broad applications in data visualization, database systems, and network analysis. Database query explain plans (PostgreSQL's EXPLAIN, MySQL's EXPLAIN ANALYZE) group operations by execution level to show query plan depth and parallelism. Org chart rendering and visualization libraries like D3.js group nodes by level to compute horizontal layouts. In networking, traceroute effectively groups network hops by level to display the path topology to a destination. Build systems like Bazel and Buck process dependency trees level by level to maximize parallelism, building all independent targets at the same depth simultaneously. This is one of the most commonly asked tree problems in interviews at companies like Amazon and Microsoft, testing level-order traversal with grouped output.`,
  },
  {
    id: "04_binary_tree_i/13_level_averages",
    name: "Level Averages",
    section: "04_binary_tree_i",
    usage: `Computing per-level averages in a tree combines BFS traversal with aggregation, a pattern used in monitoring, analytics, and load balancing systems. Infrastructure monitoring tools compute average response times at each tier of a service hierarchy (load balancer, API gateway, microservices, database) to identify bottleneck layers. In machine learning, random forest implementations average predictions across trees at each ensemble depth for staged inference. Network management systems compute average bandwidth utilization at each level of a hierarchical network topology. Database query optimizers estimate average selectivity at each level of a join tree to choose optimal execution plans. This problem is popular in interviews because it extends basic level-order traversal with running statistics, testing both BFS mechanics and careful accumulator management.`,
  },
  {
    id: "05_two_pointer/01_is_palindrome",
    name: "Is Palindrome",
    section: "05_two_pointer",
    usage: `Palindrome checking with two pointers is a fundamental string validation pattern used across multiple domains. In bioinformatics, palindromic DNA sequences are recognition sites for restriction enzymes and play structural roles in tRNA and CRISPR/Cas9 gene editing systems; tools like EMBOSS palindrome scan genomes for these patterns. Input validation systems in web applications check for palindromic patterns in user-submitted data for sanitization and formatting rules. Natural language processing pipelines detect palindromes in text analysis and linguistic research. In competitive programming and coding interviews at companies like Google, Amazon, and Meta, palindrome checking is one of the most frequently asked string problems because it cleanly tests two-pointer technique, edge case handling with even/odd lengths, and in-place O(1) space solutions.`,
  },
  {
    id: "05_two_pointer/02_uncompress",
    name: "Uncompress",
    section: "05_two_pointer",
    usage: `Decompression of run-length encoded strings is used in image processing, data storage, and network protocols. Fax machines standardized under ITU T.45 use run-length encoding where transmitted data must be decompressed to reconstruct scanned documents. Image formats like PCX, TGA, and PackBits (used by Apple's MacPaint) store pixel data as RLE-compressed streams that must be uncompressed for display. Columnar databases like Apache Parquet and ClickHouse use RLE compression on sorted columns (status codes, country codes) and decompress on read for query execution. In virtual machine live migration, RLE-compressed memory pages are decompressed at the destination host to reduce transfer time by up to 50%. This problem tests two-pointer parsing and string building, making it a practical interview question that maps directly to real compression systems.`,
  },
  {
    id: "05_two_pointer/03_compress",
    name: "Compress",
    section: "05_two_pointer",
    usage: `Run-length encoding compression is one of the oldest and most widely deployed compression techniques in computing. It is used in the JPEG standard as a final encoding stage after quantization, in fax transmission protocols (ITU T.4), and in bitmap image formats like BMP and PCX. Columnar databases including Apache Parquet, Apache ORC, and Google's Capacitor (used in BigQuery) apply RLE to compress columns with low cardinality, achieving dramatic space savings on sorted data with repeated values. Embedded systems with limited memory, such as the Pixy robotic camera, use RLE to compress labeled video frames before transmission. Game developers use RLE for sprite data compression in retro-style and indie games. This problem tests the compress side of two-pointer traversal with careful counting logic, and it frequently appears in interviews alongside its decompress counterpart.`,
  },
  {
    id: "05_two_pointer/04_five_sort",
    name: "Five Sort",
    section: "05_two_pointer",
    usage: `Array partitioning, moving specific elements to one end, is the core operation behind quicksort's partition step and the Dutch National Flag algorithm proposed by Dijkstra. Quicksort, the default sorting algorithm in many standard libraries (Python's Timsort uses a variant, C's qsort, and Java's Arrays.sort for primitives), relies on partitioning to divide arrays around a pivot. Three-way partitioning handles arrays with many duplicate keys efficiently, which is critical for database sort operations on columns with low cardinality. In systems programming, memory allocators partition free blocks by size class using similar swap-to-end logic. Operating systems use partitioning in process scheduling to separate high and low priority tasks. This problem directly tests in-place two-pointer swapping with O(n) time and O(1) space, and it is a common interview question at companies like Microsoft and Google.`,
  },
  {
    id: "05_two_pointer/05_is_subsequence",
    name: "Is Subsequence",
    section: "05_two_pointer",
    usage: `Subsequence checking determines whether one string appears as a subsequence of another, with applications spanning text processing, bioinformatics, and developer tools. The Unix diff utility finds the longest common subsequence between two file versions to compute minimal edit scripts, which is how Git generates diffs. In bioinformatics, subsequence matching is fundamental to DNA sequence alignment tools like BLAST (Basic Local Alignment Search Tool), used at institutions like NCBI to compare genetic sequences across species for evolutionary analysis and drug development. Text editors and IDEs like VS Code use fuzzy subsequence matching for file finder (Cmd+P) and symbol search, where typing 'abc' matches 'a_big_cat'. Autocomplete systems at companies like Google and Spotify use subsequence matching to surface suggestions from partial input. This is a high-frequency interview problem because it elegantly demonstrates the two-pointer technique in O(n) time with O(1) space.`,
  },
  {
    id: "06_graph_i/01_has_path",
    name: "Has Path",
    section: "06_graph_i",
    usage: `Determining whether a path exists between two nodes in a graph is the most fundamental graph reachability query, underlying virtually every graph-based system. Social networks like Facebook and LinkedIn check path existence to determine if two users are connected, which gates features like messaging and profile visibility. Network monitoring tools like Nagios and PagerDuty verify reachability between servers to detect outages and partition events. In access control systems, path existence in permission graphs determines whether a user can reach a resource through a chain of role assignments. Garbage collectors in languages like Java and Go use reachability analysis (essentially has-path from GC roots) to determine which objects are still alive. This is the canonical introductory graph problem in coding interviews and appears across all major tech companies as a building block for harder graph questions.`,
  },
  {
    id: "06_graph_i/02_undirected_path",
    name: "Undirected Path",
    section: "06_graph_i",
    usage: `Finding paths in undirected graphs requires cycle-aware traversal with visited tracking, a pattern used extensively in network and social systems. Peer-to-peer networks like BitTorrent and IPFS use undirected graph traversal to discover peers and locate content across the mesh. Social network features like Facebook's mutual friends and LinkedIn's connection paths traverse undirected friendship graphs. In telecommunications, network topology discovery protocols traverse undirected links between switches and routers to build network maps. Indoor navigation systems model building layouts as undirected graphs where rooms are nodes and doorways are edges, then find paths between locations. This problem tests whether candidates can handle undirected edges (adding both directions to adjacency lists) and use visited sets to prevent infinite cycles, which are essential skills for any graph-based interview question.`,
  },
  {
    id: "06_graph_i/03_connected_components_count",
    name: "Connected Components Count",
    section: "06_graph_i",
    usage: `Counting connected components identifies isolated clusters in a graph, a pattern critical to network analysis, data deduplication, and social community detection. Identity resolution systems at companies like Experian and Salesforce use connected components to merge duplicate customer records across data sources into unified Customer 360 profiles. In social network analysis, connected components identify distinct communities and isolated users, which informs content recommendation and trust scoring. Network administrators use component counting to detect network partitions and isolated subnets after failures. In VLSI chip design, connected component analysis identifies isolated circuits in chip layouts. Image processing uses connected component labeling to identify distinct objects in binary images, which is fundamental to OCR and computer vision pipelines. This is a common interview question that tests graph traversal completeness and the ability to handle disconnected graphs.`,
  },
  {
    id: "06_graph_i/04_largest_component",
    name: "Largest Component",
    section: "06_graph_i",
    usage: `Finding the largest connected component in a graph is used in network resilience analysis, community detection, and infrastructure planning. In social networks, the largest component represents the main connected user base, and platforms like Twitter and Reddit monitor its size as a health metric; fragmentation indicates platform issues. In epidemiology, the largest component of a contact-tracing graph determines the maximum outbreak spread potential, informing public health policy. Network engineers analyze the largest component after simulated failures to assess infrastructure resilience and plan redundancy. In e-commerce, the largest product similarity cluster helps identify the dominant product category for recommendation systems. This problem extends connected components with size tracking and is a common interview question that tests the ability to compare across multiple traversals.`,
  },
  {
    id: "06_graph_i/05_shortest_path",
    name: "Shortest Path",
    section: "06_graph_i",
    usage: `BFS-based shortest path in unweighted graphs is the algorithm behind social network degree-of-separation calculations, network routing, and navigation systems. LinkedIn uses BFS to compute connection distances for its 'Degrees of Separation' feature, showing how many hops separate two professionals. Network routing protocols like OSPF (Open Shortest Path First) use BFS-derived shortest path computations to build routing tables across autonomous systems. In puzzle-solving AI, BFS finds minimum-move solutions for problems like the 15-puzzle, Rubik's cube configurations, and chess endgames. Web crawlers use BFS to prioritize pages by link distance from seed URLs, ensuring near-site content is indexed first. This problem is a top interview question at companies like Google, Meta, and Uber because it tests BFS with distance tracking and path reconstruction in O(V + E) time.`,
  },
  {
    id: "06_graph_i/06_island_count",
    name: "Island Count",
    section: "06_graph_i",
    usage: `Island counting is a grid-based flood fill problem with direct applications in image processing, geographic information systems, and computer vision. The flood fill algorithm, which powers the paint bucket tool in Photoshop and GIMP, is essentially island detection on a pixel grid. In satellite image analysis, NOAA and NASA use connected region detection to count and measure landmasses, ice sheets, and vegetation patches from orbital imagery. Medical imaging systems use flood fill to segment tumors, organs, and anatomical structures in CT and MRI scans. In game development, terrain generation algorithms count and classify connected land regions for map building. PCB (printed circuit board) design tools use connected component analysis on grid layouts to verify circuit continuity. This is one of the most popular interview problems at FAANG companies, testing BFS/DFS on 2D grids with visited marking.`,
  },
  {
    id: "06_graph_i/07_minimum_island",
    name: "Minimum Island",
    section: "06_graph_i",
    usage: `Finding the smallest island by area extends the flood fill pattern with size comparison, a technique used in image noise removal, quality control, and geographic analysis. In image processing, small connected regions are often noise artifacts; OpenCV and scikit-image filter them by identifying minimum-area components and removing those below a threshold. In manufacturing quality control, vision systems detect defects by finding the smallest anomalous regions on product surfaces. Geographic information systems classify small islands and islets separately from major landmasses for maritime boundary calculations. In PCB manufacturing, minimum copper region detection identifies potential defects in circuit traces. This problem tests whether candidates can track component sizes during graph traversal and compare across traversals, combining flood fill mechanics with optimization logic in a way that interviewers at Amazon and Google favor.`,
  },
  {
    id: "06_graph_i/08_closest_carrot",
    name: "Closest Carrot",
    section: "06_graph_i",
    usage: `BFS to find the nearest target in a grid is the core algorithm for proximity search in spatial systems. Navigation apps like Google Maps and Waze use multi-source BFS variants to find the nearest gas station, restaurant, or parking spot from a user's current position. In warehouse robotics, Amazon's Kiva robots use BFS on grid-based warehouse maps to find the shortest path to the nearest target shelf. In game AI, enemy units use BFS to locate the nearest resource, health pack, or player character on tile-based maps. Emergency response systems compute the nearest hospital or fire station from an incident location using BFS on road network grids. This problem tests BFS with a starting position constraint and early termination on first target found, making it a practical interview question that maps directly to real location-based services.`,
  },
  {
    id: "06_graph_i/09_best_bridge",
    name: "Best Bridge",
    section: "06_graph_i",
    usage: `Finding the shortest bridge between two islands combines flood fill identification with multi-source BFS, a pattern used in infrastructure planning and network design. In telecommunications, engineers determine the minimum cable length needed to connect two isolated network segments, which is equivalent to finding the shortest bridge between graph components. Urban planners use similar algorithms to determine optimal bridge or tunnel placement between disconnected districts. In VLSI design, the shortest wire path between two circuit regions minimizes signal delay and power consumption. Cloud infrastructure teams at AWS and Azure use component bridging analysis to plan the minimum number of cross-region links needed to connect isolated data center clusters. This is an advanced interview problem that tests multi-phase graph algorithms: first identifying components via DFS/BFS, then using multi-source BFS to find minimum distance between them.`,
  },
  {
    id: "06_graph_i/10_prereqs_possible",
    name: "Prereqs Possible",
    section: "06_graph_i",
    usage: `Cycle detection in directed graphs determines whether prerequisite relationships are satisfiable, a problem directly implemented in build systems, package managers, and course schedulers. Build tools like Make, Maven, Gradle, and Bazel perform topological sorts on dependency graphs and fail with circular dependency errors when cycles are detected. Package managers like pip, npm, and cargo check for dependency cycles before resolving installation order. University course registration systems at institutions nationwide validate that prerequisite chains are acyclic before allowing enrollment. Spreadsheet applications like Excel and Google Sheets detect circular references in formula dependency graphs to prevent infinite recalculation loops. The Linux kernel's module loader checks for cyclic dependencies before loading kernel modules. This is LeetCode's famous 'Course Schedule' problem and appears in interviews at virtually every major tech company, testing cycle detection via DFS with three-color marking or Kahn's algorithm.`,
  },
  {
    id: "07_dynamic_programming/01_fib",
    name: "Fib",
    section: "07_dynamic_programming",
    usage: `Fibonacci with memoization is the canonical introduction to dynamic programming and the concept of trading space for time. In production systems, the same memoization pattern underpins caching layers at companies like Netflix and Spotify, where expensive computations are stored rather than recalculated on every request. The Fibonacci sequence itself appears in financial trading through Fibonacci retracement levels, used by quantitative analysts at firms like Jane Street and Two Sigma to predict price support and resistance zones. Agile teams at companies including Atlassian use Fibonacci numbers for story-point estimation in sprint planning. This problem is a near-universal interview warm-up at FAANG companies, testing whether candidates understand overlapping subproblems and optimal substructure before moving to harder DP questions.`,
  },
  {
    id: "07_dynamic_programming/02_tribonacci",
    name: "Tribonacci",
    section: "07_dynamic_programming",
    usage: `The tribonacci sequence generalizes Fibonacci to a 3-term recurrence and teaches candidates to handle arbitrary-order recurrences with the same memoization and tabulation techniques. Multi-term recurrences appear in signal processing, population modeling, and queueing theory, where the state at time t depends on multiple prior states. Systems like Apache Kafka's consumer lag prediction and load-balancing algorithms at AWS use sliding-window aggregations that mirror multi-term recurrence computations. In interviews, tribonacci tests whether you can adapt a known pattern rather than just memorize a solution, which is exactly what companies like Google and Meta want to evaluate. The constant-space optimization, keeping only three variables instead of a full table, demonstrates the space-reduction technique that scales to real resource-constrained environments like embedded systems and mobile apps.`,
  },
  {
    id: "07_dynamic_programming/03_sum_possible",
    name: "Sum Possible",
    section: "07_dynamic_programming",
    usage: `Sum Possible is a variant of the unbounded knapsack and subset sum family of problems, which model whether a target value can be composed from a set of reusable components. This pattern appears in resource allocation systems at cloud providers like AWS and GCP, where engineers determine whether a requested VM configuration can be assembled from available hardware pools. Payment platforms at Stripe and Square use similar logic to verify whether a transaction amount can be split into valid installment sizes. The unbounded nature of the problem, allowing repeated use of the same denomination, mirrors real scenarios like bandwidth allocation across network links or distributing compute credits. It is a staple interview question at Amazon and Microsoft, testing a candidate's ability to define state transitions and base cases in DP.`,
  },
  {
    id: "07_dynamic_programming/04_min_change",
    name: "Min Change",
    section: "07_dynamic_programming",
    usage: `The minimum coin change problem is a textbook unbounded knapsack problem with direct applications in financial systems and payment processing. ATMs at banks like Chase and Wells Fargo use variants of this algorithm to dispense cash with the fewest bills possible, and vending machine firmware from companies like Crane and Azkoyen solves it in real time to minimize coin dispensing. Retail point-of-sale systems built by Square and Clover implement similar logic for cash-back calculations. Beyond currency, the same structure applies to minimizing the number of API calls to compose a result, or minimizing network hops in routing. This is one of the most frequently asked DP problems in technical interviews at Google, Amazon, and Bloomberg, and it cleanly demonstrates the difference between greedy and DP approaches since greedy fails for non-standard denominations.`,
  },
  {
    id: "07_dynamic_programming/05_count_paths",
    name: "Count Paths",
    section: "07_dynamic_programming",
    usage: `Counting unique paths in a grid from top-left to bottom-right is a foundational 2D dynamic programming problem with direct parallels in robotics path planning and warehouse automation. Companies like Amazon Robotics and Boston Dynamics use grid-based pathfinding models where enumerating feasible routes informs probabilistic motion planning. Autodesk published research on path counting for grid-based navigation in AI agents, demonstrating its use in game development and simulation engines. The combinatorial interpretation, which equals C(m+n-2, m-1), connects it to probability and statistics used in quantitative finance for lattice-based option pricing models at firms like Goldman Sachs. In interviews, this problem tests 2D DP table construction and the ability to recognize that each cell depends on its top and left neighbors.`,
  },
  {
    id: "07_dynamic_programming/06_max_path_sum",
    name: "Max Path Sum",
    section: "07_dynamic_programming",
    usage: `The maximum path sum in a grid problem extends basic grid traversal by optimizing a value function along a constrained path, a pattern central to logistics and supply chain optimization. Warehouse management systems at Amazon and Walmart use similar DP formulations to route picking robots through shelving grids to maximize items collected per trip. In image processing, maximum-sum paths through pixel intensity grids are used for seam carving, the content-aware resizing technique built into Adobe Photoshop. The problem also models profit maximization in grid-based resource extraction scenarios used by mining and energy companies. It appears regularly in interviews at companies like Uber and DoorDash, where grid-based optimization maps directly to delivery routing and surge pricing region analysis.`,
  },
  {
    id: "07_dynamic_programming/07_non_adjacent_sum",
    name: "Non Adjacent Sum",
    section: "07_dynamic_programming",
    usage: `The non-adjacent sum problem, widely known as the House Robber problem on LeetCode, asks for the maximum sum of elements where no two selected elements are adjacent. This pattern applies directly to job scheduling with cooldown constraints, such as CPU task schedulers in operating systems like Linux, where certain tasks cannot run back-to-back due to thermal or resource limits. Advertising platforms at Meta and Google use similar models to space out ad impressions so users are not shown the same ad consecutively. Telecommunications companies apply this logic to frequency channel assignment, ensuring adjacent towers do not broadcast on the same frequency. It is among the most commonly asked DP problems at FAANG interviews and serves as a gateway to circular variants and tree-based extensions like House Robber II and III.`,
  },
  {
    id: "07_dynamic_programming/08_summing_squares",
    name: "Summing Squares",
    section: "07_dynamic_programming",
    usage: `The summing squares problem asks for the minimum number of perfect squares that sum to a given integer n, grounded in Lagrange's four-square theorem which guarantees an answer of at most four. While the number theory is classical, the DP approach teaches BFS-like level exploration and optimal decomposition, patterns used in resource quantization and bin-packing systems. Cloud providers like AWS use analogous decomposition when allocating fixed-size memory pages or compute units to satisfy arbitrary resource requests. The problem also connects to integer partition theory used in cryptographic protocols and error-correcting codes. It is a popular medium-difficulty interview question at companies like Google and Apple, and it effectively tests whether candidates can model a shortest-path problem as DP or BFS.`,
  },
  {
    id: "07_dynamic_programming/09_counting_change",
    name: "Counting Change",
    section: "07_dynamic_programming",
    usage: `Counting the number of ways to make change extends the classic coin change problem from optimization to combinatorics, asking how many distinct combinations of denominations sum to a target. This enumeration pattern is used in financial modeling for portfolio construction, where analysts at firms like BlackRock and Vanguard count the number of asset allocation strategies that meet a target return. Payment processors use it to analyze transaction splitting options, and game designers at studios like Blizzard and Riot use it to balance in-game economies by understanding how many ways players can combine items to reach a power threshold. The subtle difference between permutation counting and combination counting, controlled by the loop order in the DP table, is a common interview trap at companies like Amazon and Goldman Sachs.`,
  },
  {
    id: "07_dynamic_programming/10_array_stepper",
    name: "Array Stepper",
    section: "07_dynamic_programming",
    usage: `The Array Stepper or Jump Game problem determines whether the end of an array is reachable given maximum jump lengths at each position. This is a reachability problem with direct applications in network routing, where each node has a limited forwarding range and the system must determine whether a packet can traverse the network. Game engines at Unity and Unreal use similar reachability checks for platformer level validation, ensuring players can actually complete a designed level. In CI/CD pipeline design at companies like GitLab and CircleCI, the pattern models whether a build can progress through stages given conditional step capabilities. The greedy O(n) solution, tracking the farthest reachable index, is a favorite interview question at Meta and Apple because it tests whether candidates can simplify a DP problem into a greedy one.`,
  },
  {
    id: "07_dynamic_programming/11_max_palin_subsequence",
    name: "Max Palin Subsequence",
    section: "07_dynamic_programming",
    usage: `The longest palindromic subsequence problem finds the longest subsequence of a string that reads the same forwards and backwards, using a 2D DP table over substrings. In bioinformatics, palindromic motifs in DNA and RNA sequences form stem-loop structures that regulate gene expression, and tools at companies like Illumina and 23andMe scan genomes for these patterns to identify regulatory regions and restriction enzyme sites. The algorithm is also relevant in data compression, where detecting symmetric structure in data streams enables more efficient encoding. Natural language processing pipelines at companies like Grammarly use palindromic analysis as a feature in pattern recognition models. This is a classic interval DP problem frequently asked at Google and Amazon, testing the ability to define recurrences over substring boundaries.`,
  },
  {
    id: "07_dynamic_programming/12_overlap_subsequence",
    name: "Overlap Subsequence",
    section: "07_dynamic_programming",
    usage: `The longest common subsequence (LCS) problem is the algorithmic backbone of every diff tool and version control system in existence. Git's diff engine, GNU diff, and tools like Meld and Beyond Compare all reduce file comparison to LCS, where the common subsequence represents unchanged lines and everything else is the diff. GitHub, GitLab, and Bitbucket render pull request diffs using LCS-based algorithms millions of times per day. In bioinformatics, BLAST and other sequence alignment tools at the NIH and EBI use LCS variants to compare DNA, RNA, and protein sequences across species. The problem also underpins plagiarism detection systems at Turnitin and Moss. It is one of the most important DP problems in technical interviews, tested at virtually every major tech company.`,
  },
  {
    id: "07_dynamic_programming/13_can_concat",
    name: "Can Concat",
    section: "07_dynamic_programming",
    usage: `The Can Concat problem is the word break problem: determining whether a string can be segmented into a sequence of dictionary words. Search engines at Google and Bing solve this continuously when parsing queries without spaces, such as interpreting "newyorkcity" as "new york city." Social media platforms like Twitter and Instagram apply it to hashtag segmentation, breaking compound hashtags into constituent words for indexing and sentiment analysis. NLP systems at Apple (Siri) and Amazon (Alexa) use word segmentation for speech-to-text post-processing, especially for languages like Chinese and Thai that lack explicit word boundaries. URL parsing at web-scale, as documented in Microsoft Research's work on URL word breaking, depends on this exact algorithm. It is a top-25 most-asked interview question at FAANG companies.`,
  },
  {
    id: "07_dynamic_programming/14_quickest_concat",
    name: "Quickest Concat",
    section: "07_dynamic_programming",
    usage: `Quickest Concat extends the word break problem from a boolean feasibility check to an optimization problem: finding the minimum number of dictionary words needed to form a string. This has direct applications in text compression and tokenization pipelines used by large language models at OpenAI and Anthropic, where minimizing the number of tokens to represent text improves inference efficiency. Search engines use minimum-segmentation scoring to rank query interpretations, preferring fewer, more meaningful word splits over many fragmented ones. DNS and URL shortening services at Cloudflare and Bitly use similar decomposition to parse and validate compound domain strings. The problem cleanly demonstrates the transition from DFS with memoization to BFS for shortest-path DP, a pattern tested in interviews at Google, Meta, and Microsoft.`,
  },
  {
    id: "07_dynamic_programming/15_semesters_required",
    name: "Semesters Required",
    section: "07_dynamic_programming",
    usage: `Semesters Required is a longest-path-in-DAG problem, which directly models the critical path method (CPM) used in project management since the 1950s. Tools like Microsoft Project, Jira, and Asana compute critical paths to determine minimum project duration given task dependencies. In build systems, tools like Bazel at Google, Buck at Meta, and Gradle use DAG longest-path analysis to determine the minimum wall-clock time for a parallel build. CI/CD pipelines at GitHub Actions and CircleCI model stage dependencies as DAGs and compute the critical path to estimate pipeline duration. Compiler instruction scheduling at Intel and AMD uses the same algorithm to determine minimum execution cycles for a basic block. It is a graph + DP hybrid problem commonly asked at Google, Amazon, and Uber.`,
  },
  {
    id: "08_stack/01_paired_parentheses",
    name: "Paired Parentheses",
    section: "08_stack",
    usage: `Balanced parentheses checking is a fundamental operation in every compiler and interpreter ever built, from GCC and Clang to the Python and JavaScript parsers. IDEs like VS Code, IntelliJ, and Xcode use this algorithm in real time to highlight matching brackets and flag syntax errors as developers type. JSON and XML validators in web frameworks like Express.js and Django rely on bracket balancing to reject malformed payloads before they reach application logic. Database query parsers at Oracle, PostgreSQL, and MySQL validate SQL expression syntax using the same stack-based approach. This is the single most common stack problem in technical interviews, appearing at nearly every company, and it serves as the entry point for understanding how stacks model nested structure in computation.`,
  },
  {
    id: "08_stack/02_befitting_brackets",
    name: "Befitting Brackets",
    section: "08_stack",
    usage: `Befitting Brackets extends balanced parentheses to handle multiple bracket types: parentheses, square brackets, and curly braces, each requiring proper nesting and matching. This is exactly what compilers like GCC and LLVM do during lexical analysis, and what linters like ESLint and Pylint check continuously in developer toolchains. Configuration file parsers for formats like JSON, YAML, and TOML must validate that multiple delimiter types are correctly paired, a task performed billions of times daily across web servers running Nginx and Apache. HTML and XML parsers in every web browser, including Chrome's Blink engine and Firefox's Gecko, validate tag nesting using this multi-bracket matching logic. The problem is a standard interview question at companies like Amazon, Microsoft, and Bloomberg, testing stack fundamentals and edge-case handling.`,
  },
  {
    id: "08_stack/03_decompress_braces",
    name: "Decompress Braces",
    section: "08_stack",
    usage: `Decompress Braces implements nested string decompression, where patterns like "2{ab3{c}}" expand to "abcccabccc," mirroring run-length encoding with nesting. This pattern is used in data compression formats: gzip, zlib, and LZ77-family compressors at Cloudflare and Akamai handle nested repetition structures when decompressing web traffic at scale. Template engines like Jinja2, Handlebars, and Mustache process nested template expansions that follow the same recursive stack-based logic. Kubernetes and Terraform configuration files use nested variable interpolation that parsers must recursively expand. Log aggregation systems at Datadog and Splunk decompress compressed log streams using similar stack-based expansion algorithms. This problem tests recursive thinking and stack mastery in interviews at Google, Airbnb, and Stripe.`,
  },
  {
    id: "08_stack/04_nesting_score",
    name: "Nesting Score",
    section: "08_stack",
    usage: `The nesting score problem assigns scores to nested bracket structures, where "()" scores 1 and "(A)" scores 2*A, testing the ability to evaluate recursive structure depth using a stack. This scoring model mirrors how compilers compute expression precedence and how complexity analysis tools like GNU Complexity measure code nesting depth to flag overly complex functions. Static analysis tools at SonarQube and CodeClimate use nesting depth scoring to calculate cyclomatic complexity and cognitive complexity metrics that enforce code quality standards. Parser generators like ANTLR and Bison build parse trees where node depth directly affects evaluation order, following the same doubling-per-nesting-level logic. The problem appears in interviews at companies like Google and Uber, testing whether candidates can maintain a running computation state on a stack rather than using recursion.`,
  },
  {
    id: "09_array_and_string/01_running_sum",
    name: "Running Sum",
    section: "09_array_and_string",
    usage: `The running sum, or prefix sum, is one of the most versatile preprocessing techniques in all of computer science, transforming O(n) range-sum queries into O(1) lookups after a single linear pass. Database engines at PostgreSQL, ClickHouse, and Google BigQuery use prefix sums internally for window functions like SUM() OVER and cumulative aggregations across billions of rows. Real-time analytics dashboards at Datadog, Grafana, and New Relic compute rolling totals over streaming time-series data using prefix sum arrays. Financial systems at Bloomberg and Reuters calculate cumulative returns and running P&L using this exact technique. In interviews, prefix sum is the gateway pattern for subarray problems, and it appears at every major tech company as either a standalone question or a building block for harder problems.`,
  },
  {
    id: "09_array_and_string/02_has_subarray_sum",
    name: "Has Subarray Sum",
    section: "09_array_and_string",
    usage: `Has Subarray Sum uses the prefix sum plus hash set technique to determine in O(n) time whether any contiguous subarray sums to a target value. This pattern is critical in financial surveillance systems at firms like NASDAQ and the SEC, where analysts detect suspicious trading patterns by finding time windows where transaction volumes hit specific thresholds. Network intrusion detection systems at Palo Alto Networks and CrowdStrike scan packet streams for byte-count windows matching known attack signatures using the same approach. Streaming analytics platforms at Confluent (Kafka Streams) and Apache Flink use prefix-sum-based windowed aggregations to trigger alerts when metrics cross thresholds. The combination of prefix sums with hash-based lookup is a high-frequency interview pattern at Google, Meta, and Amazon, testing both algorithmic insight and data structure selection.`,
  },
  {
    id: "09_array_and_string/03_subarray_sum_count",
    name: "Subarray Sum Count",
    section: "09_array_and_string",
    usage: `Subarray Sum Count extends the boolean subarray-sum check to count all contiguous subarrays that sum to a target, using prefix sums with a hash map that tracks frequency of each prefix sum seen so far. This is LeetCode 560, one of the most asked medium-difficulty problems at companies including Google, Meta, Microsoft, and Amazon. In practice, this pattern powers time-series anomaly detection at observability platforms like Datadog and Splunk, where engineers count how many time windows exhibit a specific aggregate behavior. Revenue analytics teams at Shopify and Stripe use it to count the number of transaction windows hitting exact dollar thresholds for regulatory reporting. The key insight that prefix[i] minus prefix[j] equals k implies a valid subarray between j+1 and i is a pattern that generalizes to dozens of related problems, making it a critical building block for interview preparation.`,
  },
  {
    id: "09_array_and_string/04_merge_sort",
    name: "Merge Sort",
    section: "09_array_and_string",
    usage: `Merge sort is the algorithm of choice whenever stability and guaranteed O(n log n) worst-case performance matter, which is why Python's built-in sort (Timsort) is a hybrid that uses merge sort for its merge phase. Database systems at Oracle, PostgreSQL, and MySQL use external merge sort to handle ORDER BY and JOIN operations on datasets that exceed available memory, sorting chunks on disk and merging them back. Hadoop's MapReduce framework at companies like Yahoo and LinkedIn relies on merge sort during the shuffle phase to combine and sort intermediate key-value pairs across distributed nodes. The algorithm's natural parallelizability makes it foundational in GPU computing libraries like NVIDIA's Thrust and in distributed sorting frameworks at Google (MapReduce) and Apache Spark. It is one of the most important sorting algorithms tested in interviews, frequently asked at every major tech company.`,
  },
  {
    id: "09_array_and_string/05_combine_intervals",
    name: "Combine Intervals",
    section: "09_array_and_string",
    usage: `Merging overlapping intervals is a core operation in calendar and scheduling systems at Google Calendar, Microsoft Outlook, and Apple Calendar, where overlapping events must be consolidated for display and conflict detection. Operating system CPU schedulers at Microsoft and Linux kernel developers use interval merging to coalesce free memory blocks and manage process time slices. Genomics pipelines at Broad Institute and Illumina merge overlapping gene annotation intervals when combining data from multiple sequencing runs. The algorithm, sort by start time then merge greedily, runs in O(n log n) and is one of the most frequently asked interval problems in technical interviews at Google, Meta, Amazon, and Bloomberg. Mastering this pattern unlocks a family of related problems including insert interval, meeting rooms, and interval list intersections.`,
  },
  {
    id: "09_array_and_string/06_binary_search",
    name: "Binary Search",
    section: "09_array_and_string",
    usage: `Binary search is arguably the most important search algorithm in computer science, reducing lookup time from O(n) to O(log n) on sorted data. Every major database system, including PostgreSQL, MySQL, and MongoDB, uses binary search within B-tree and B+ tree index structures to locate records among billions of rows in milliseconds. Search engines at Google and Bing use binary search over sorted inverted index postings lists to intersect query terms efficiently. The algorithm powers autocomplete systems at companies like Algolia and Elasticsearch, binary searching through sorted dictionaries for prefix matches. Git itself uses binary search in its "git bisect" command to find the commit that introduced a bug. Binary search is tested in interviews at virtually every tech company and appears in variants like search-in-rotated-array, find-first-occurrence, and search-insert-position.`,
  },
  {
    id: "09_array_and_string/07_detect_dictionary",
    name: "Detect Dictionary",
    section: "09_array_and_string",
    usage: `Detect Dictionary verifies whether a list of words follows a given character ordering, a simplification of the Alien Dictionary problem that uses topological sort on character precedence graphs. This pattern is directly applicable to internationalization (i18n) systems at companies like Google, Apple, and Microsoft, where locale-specific collation orders must be validated and enforced for correct string sorting across languages. The Unicode Collation Algorithm (UCA), maintained by the Unicode Consortium and implemented in ICU libraries used by Chrome, Firefox, and every major OS, relies on custom character orderings that must be verified for consistency. Database systems enforce custom collation sequences for ORDER BY queries in non-Latin scripts, and search engines like Elasticsearch support custom analyzers with language-specific character orderings. The problem is a well-known interview question at Meta, Google, and Airbnb, testing graph construction from pairwise constraints and topological sort or BFS-based verification.`,
  },
  {
    id: "10_linked_list_ii/01_linked_palindrome",
    name: "Linked Palindrome",
    section: "10_linked_list_ii",
    usage: `Palindrome detection on linked lists exercises the fast/slow pointer split-and-reverse technique that underpins many in-place sequence checks. In bioinformatics, palindromic nucleotide sequences in DNA mark restriction enzyme cut sites, making palindrome recognition critical for tools used in genetic engineering and CRISPR workflows. In networking, palindromic patterns appear in certain error-correcting codes where symmetry helps verify data integrity in transmitted packets. The problem is a staple at companies like Google and Amazon because it combines three sub-problems (finding the midpoint, reversing a sublist, and comparing two halves) into one O(n) time, O(1) space solution. Mastering it also prepares you for follow-up questions about restoring the original list after comparison, which tests attention to side effects in shared data structures.`,
  },
  {
    id: "10_linked_list_ii/02_middle_value",
    name: "Middle Value",
    section: "10_linked_list_ii",
    usage: `Finding the middle node of a linked list using the fast/slow (tortoise and hare) pointer technique is foundational for divide-and-conquer operations on sequential data. This exact pattern is used internally in merge sort on linked lists, which Linux kernel's linked-list sort implementation relies on. The technique also applies to load-balanced splitting of work queues, where a dispatcher needs to halve a task list without knowing its length upfront. In streaming systems, the concept generalizes to finding the median element in a single pass, a requirement in real-time analytics at companies like Netflix and Spotify. It is one of the most frequently tested linked list problems at Meta, Apple, and Microsoft because it validates understanding of pointer manipulation in O(n) time with O(1) space.`,
  },
  {
    id: "10_linked_list_ii/03_linked_list_cycle",
    name: "Linked List Cycle",
    section: "10_linked_list_ii",
    usage: `Floyd's cycle detection algorithm (tortoise and hare) is essential for detecting infinite loops and circular references in real-world systems. Operating systems use it to detect deadlocks in resource dependency chains, and garbage collectors in languages like Java and Go use cycle detection to identify unreachable circular references during memory reclamation. In financial systems, banks apply cycle detection to flag potential money laundering, where funds flow through a series of accounts and return to the source. Network engineers use it to identify routing loops in protocols like OSPF. The algorithm's O(1) space complexity makes it practical for production systems where memory is constrained. It appears in interviews at virtually every major tech company and is considered a must-know algorithm.`,
  },
  {
    id: "10_linked_list_ii/04_undupe_sorted_linked_list",
    name: "Undupe Sorted Linked List",
    section: "10_linked_list_ii",
    usage: `Removing duplicates from a sorted linked list is a practical data-cleaning operation that mirrors real-world ETL (Extract, Transform, Load) pipelines. Database engines perform this operation when enforcing unique constraints on sorted indexes, and search engines like Elasticsearch deduplicate sorted posting lists during index merges. In event-processing systems at companies like Stripe and Square, transaction logs are often sorted chronologically and must be deduplicated before aggregation. The algorithm runs in O(n) time with O(1) space, making it ideal for streaming scenarios where data arrives pre-sorted. Interviewers at LinkedIn and Bloomberg use this problem to test careful pointer handling and edge-case awareness around head and tail nodes.`,
  },
  {
    id: "10_linked_list_ii/05_create_linked_list",
    name: "Create Linked List",
    section: "10_linked_list_ii",
    usage: `Constructing a linked list from an array is a fundamental builder pattern that appears in virtually every system that uses linked data structures. Compilers and interpreters build linked AST (Abstract Syntax Tree) node chains from tokenized arrays during parsing. Memory allocators like those in jemalloc and tcmalloc construct free lists from contiguous memory blocks during initialization. In test infrastructure at companies like Google and Meta, list-builder utilities are essential for setting up test fixtures for linked-list-heavy algorithms. While simple, this problem tests understanding of pointer initialization, head tracking, and iterative node appending, which are prerequisites for more advanced linked list manipulation.`,
  },
  {
    id: "10_linked_list_ii/06_add_lists",
    name: "Add Lists",
    section: "10_linked_list_ii",
    usage: `Adding two numbers represented as linked lists is the core operation behind arbitrary-precision arithmetic libraries. Cryptographic systems like RSA and elliptic curve implementations require arithmetic on integers with hundreds of digits, which are stored as linked digit chains since they exceed fixed-width integer limits. Python's built-in arbitrary-precision integers and libraries like GMP (GNU Multiple Precision) use similar digit-by-digit addition with carry propagation. Financial systems at companies like Bloomberg and Two Sigma use big-number arithmetic for precise calculations that avoid floating-point rounding errors. This problem is a top-10 most-asked question on LeetCode and appears frequently at Amazon, Microsoft, and Google interviews because it tests carry handling, unequal-length traversal, and edge cases around leading zeros.`,
  },
  {
    id: "11_binary_tree_ii/01_lowest_common_ancestor",
    name: "Lowest Common Ancestor",
    section: "11_binary_tree_ii",
    usage: `The Lowest Common Ancestor (LCA) algorithm is critical in version control systems like Git, where finding the common ancestor of two commits enables three-way merge and conflict resolution. Filesystems use LCA to compute the deepest shared directory between two file paths, which is essential for relative path resolution. In object-oriented language runtimes like the JVM and CLR, LCA of classes in an inheritance hierarchy determines method dispatch for multiple inheritance scenarios. Bioinformatics tools use LCA for taxonomic classification of metagenomic sequences, identifying the most specific shared taxon for ambiguous reads. This problem is heavily tested at Google, Meta, and Amazon, and understanding both the recursive O(n) approach and the binary-lifting O(log n) optimization is expected at senior levels.`,
  },
  {
    id: "11_binary_tree_ii/02_flip_tree",
    name: "Flip Tree",
    section: "11_binary_tree_ii",
    usage: `Inverting (mirroring) a binary tree is a classic recursive transformation with practical applications in UI rendering and graphics. Game engines use tree mirroring to flip AI decision trees when switching perspectives between players. In image processing, mirroring operations on quadtrees (a spatial tree structure) enable efficient horizontal flips of image data. The problem famously gained attention when Homebrew creator Max Howell tweeted about failing this question in a Google interview despite building widely-used software. Beyond interviews, understanding tree inversion builds intuition for recursive tree transformations used in compiler optimization passes, where expression trees are restructured for performance. It remains a common warm-up question at companies like Google, Apple, and Microsoft.`,
  },
  {
    id: "11_binary_tree_ii/03_lefty_nodes",
    name: "Lefty Nodes",
    section: "11_binary_tree_ii",
    usage: `Extracting the leftmost node at each level of a binary tree is a variant of level-order (BFS) traversal that has direct applications in tree visualization and rendering. IDE features like code folding and outline views in VS Code and IntelliJ use similar logic to display the first visible node at each depth level of an AST. In database query planners, identifying the leftmost path through a B-tree index determines the starting point for range scans. Web crawlers that process DOM trees use level-aware traversal to extract the first meaningful content element at each nesting depth. This problem tests BFS proficiency and appears at companies like Amazon and Microsoft, where tree-structured data is prevalent in product catalog hierarchies and org-chart systems.`,
  },
  {
    id: "11_binary_tree_ii/04_binary_search_tree_includes",
    name: "Binary Search Tree Includes",
    section: "11_binary_tree_ii",
    usage: `BST search is the foundation of nearly every ordered data structure in production systems. Database engines like MySQL's InnoDB and PostgreSQL use BST-derived structures (B-trees and B+ trees) for index lookups that power virtually every SQL query. In-memory caches like Redis use skip lists (a probabilistic BST variant) for sorted sets, enabling O(log n) lookups for leaderboards and time-series data. Compilers use BSTs as symbol tables for fast identifier resolution during semantic analysis. The O(log n) average-case search time degrades to O(n) for unbalanced trees, which motivates the study of self-balancing variants (AVL, Red-Black). This problem is a prerequisite for more advanced BST questions and appears across all major tech company interviews.`,
  },
  {
    id: "11_binary_tree_ii/05_is_binary_search_tree",
    name: "Is Binary Search Tree",
    section: "11_binary_tree_ii",
    usage: `Validating whether a tree satisfies the BST property is essential for maintaining data structure invariants in production systems. Database storage engines run BST validation as part of consistency checks (similar to PostgreSQL's amcheck extension) to detect index corruption after crashes or hardware failures. In compiler testing, AST validators ensure that optimization passes preserve structural invariants. Financial trading systems validate ordered data structures during startup to confirm that in-memory order books are correctly sorted before accepting live trades. The canonical solution uses an in-order traversal with min/max bounds, and a common pitfall is checking only immediate children rather than entire subtree ranges. This is a top interview question at Google, Amazon, and Bloomberg.`,
  },
  {
    id: "11_binary_tree_ii/06_post_order",
    name: "Post Order",
    section: "11_binary_tree_ii",
    usage: `Postorder traversal (left, right, root) is the natural order for operations that require processing children before their parent. Compilers use postorder traversal of expression trees to generate postfix (Reverse Polish) notation for stack-based virtual machines like the JVM bytecode interpreter. File system utilities like 'rm -rf' implicitly perform postorder traversal, deleting child files before parent directories. Memory deallocators traverse object graphs in postorder to free child allocations before parent objects. Build systems like Make process dependency trees in postorder, ensuring all prerequisites are built before the target. This traversal pattern is tested at companies like Google and Microsoft to verify understanding of recursive tree processing order.`,
  },
  {
    id: "11_binary_tree_ii/07_build_tree_in_post",
    name: "Build Tree In Post",
    section: "11_binary_tree_ii",
    usage: `Reconstructing a binary tree from its inorder and postorder traversals is a key technique in tree serialization and deserialization systems. Distributed databases like Apache Cassandra and CockroachDB serialize tree-structured indexes for network transfer and reconstruct them on receiving nodes. Protocol Buffers and other serialization frameworks that handle hierarchical data rely on similar reconstruction logic. In digital forensics, reconstructing file system trees from fragmented metadata uses analogous divide-and-conquer partitioning. The algorithm's O(n) solution using a hash map for inorder index lookup is a common optimization that interviewers at Google and Meta expect candidates to identify. Understanding this problem deeply prepares you for the broader class of tree construction problems.`,
  },
  {
    id: "11_binary_tree_ii/08_build_tree_in_pre",
    name: "Build Tree In Pre",
    section: "11_binary_tree_ii",
    usage: `Constructing a binary tree from inorder and preorder traversals complements the postorder variant and is equally important for serialization systems. Compiler front-ends reconstruct ASTs from serialized intermediate representations when performing link-time optimization across translation units. Version control systems like Git reconstruct tree objects from serialized refs during clone and fetch operations. XML and JSON parsers effectively solve a variant of this problem when rebuilding document trees from tokenized streams. The preorder root-first property makes this variant slightly more intuitive than the postorder version, and interviewers often ask both to test whether candidates truly understand the underlying recursive partitioning rather than memorizing one solution. Common at Amazon, Google, and Microsoft interviews.`,
  },
  {
    id: "11_binary_tree_ii/09_is_tree_balanced",
    name: "Is Tree Balanced",
    section: "11_binary_tree_ii",
    usage: `Checking whether a binary tree is height-balanced is fundamental to understanding why self-balancing trees (AVL, Red-Black) exist and how they maintain O(log n) operations. Database indexing engines monitor tree balance to decide when rebalancing or page splits are needed in B-tree variants. In-memory data structures in real-time systems (trading platforms, game engines) require balanced trees to guarantee worst-case latency bounds. The Linux kernel's CFS (Completely Fair Scheduler) uses a Red-Black tree and relies on balance invariants for O(log n) process scheduling. The optimal solution computes height and checks balance in a single bottom-up pass, avoiding the O(n log n) naive approach. This problem frequently appears at Amazon, Google, and Apple interviews.`,
  },
  {
    id: "12_heap/01_heap_insertion",
    name: "Heap Insertion",
    section: "12_heap",
    usage: `Heap insertion (sift-up / bubble-up) is the core operation behind priority queues used throughout systems programming. Operating system schedulers like Linux's CFS use heap-based priority queues to manage process scheduling with O(log n) insertion. Timer systems in event-driven frameworks like libuv (Node.js) and Tokio (Rust) insert timeout events into min-heaps for efficient expiration tracking. Dijkstra's shortest-path algorithm inserts and updates vertices in a min-heap, which powers routing in Google Maps, Waze, and network protocols like OSPF. Huffman coding, used in gzip and JPEG compression, builds its encoding tree through repeated heap insertions. Understanding the sift-up mechanism is essential for interviews at any company that works with real-time systems or graph algorithms.`,
  },
  {
    id: "12_heap/02_heap_deletion",
    name: "Heap Deletion",
    section: "12_heap",
    usage: `Heap deletion (extract-min/max with sift-down) is the complementary operation to insertion and is critical for any system that processes items by priority. Task schedulers in Kubernetes and Apache Mesos extract the highest-priority job from a heap when resources become available. Event-driven simulators in fields like telecommunications and logistics extract the next chronological event from a min-heap to advance simulation time. In A* pathfinding used by game engines (Unity, Unreal) and robotics, the open set is a min-heap from which the most promising node is repeatedly extracted. Hospital triage systems and airline boarding systems are real-world priority queues where extraction order directly impacts outcomes. This operation is fundamental and tested at companies like Google, Amazon, and Uber.`,
  },
  {
    id: "12_heap/03_kth_largest",
    name: "Kth Largest",
    section: "12_heap",
    usage: `Finding the kth largest element using a min-heap of size k is a pattern used extensively in streaming analytics and real-time monitoring. Search engines like Google maintain top-k results from distributed index shards, using heaps to merge and rank candidates efficiently. E-commerce platforms like Amazon use top-k algorithms for real-time bestseller lists and trending product feeds. Network monitoring tools at companies like Cloudflare identify the top-k heaviest traffic sources for DDoS detection. Social media platforms like Twitter/X and TikTok use this pattern to surface trending topics from high-velocity data streams. The heap-based approach runs in O(n log k) time, which is significantly better than full sorting when k is much smaller than n. This is one of the most common interview questions at FAANG companies.`,
  },
  {
    id: "12_heap/04_k_smallest",
    name: "K Smallest",
    section: "12_heap",
    usage: `Finding the k smallest elements from a collection is the dual of the top-k problem and appears in data-intensive systems across the industry. Database query engines use this operation to implement 'ORDER BY ... LIMIT k' queries efficiently without sorting entire result sets; PostgreSQL's top-N heapsort optimization does exactly this. In machine learning pipelines at companies like Google and Netflix, k-nearest-neighbor searches use min-heaps to find the k closest data points for classification and recommendation. Log aggregation systems like Splunk and Datadog find the k least frequent error codes to identify rare anomalies. MapReduce frameworks like Hadoop use heap-based merging of k sorted partitions during the reduce phase. The max-heap approach (maintaining a heap of size k) provides O(n log k) performance, making it practical for large-scale data processing.`,
  },
  {
    id: "13_exhaustive_recursion/01_subsets",
    name: "Subsets",
    section: "13_exhaustive_recursion",
    usage: `Generating all subsets (the power set) is the backbone of combinatorial search algorithms used across optimization and AI. Feature selection in machine learning at companies like Google Brain and OpenAI evaluates subsets of input features to find optimal model configurations. In circuit design and VLSI testing, subset enumeration generates test vectors that cover all possible input combinations. Network security teams enumerate subsets of firewall rules to identify minimal rule sets that maintain coverage. The power set grows exponentially (2^n), making this problem a gateway to understanding NP-hard problems and the need for pruning strategies like branch-and-bound. It is a foundational backtracking problem tested at Google, Meta, and Amazon, often as a warm-up before harder combinatorial questions.`,
  },
  {
    id: "13_exhaustive_recursion/02_permutations",
    name: "Permutations",
    section: "13_exhaustive_recursion",
    usage: `Generating all permutations is central to brute-force optimization and exhaustive testing in multiple domains. Cryptographic analysis uses permutation enumeration to evaluate cipher strength, and key schedule algorithms in AES rely on permutation operations. Logistics companies like UPS and FedEx solve variants of the traveling salesman problem by evaluating route permutations for small delivery clusters. In compiler optimization, instruction scheduling explores permutations of independent instructions to maximize pipeline utilization. Test frameworks generate permutations of input parameters for exhaustive integration testing. The O(n!) growth makes permutation generation impractical for large inputs, which motivates the study of heuristic and approximation algorithms. This problem appears frequently at Google, Amazon, and Microsoft interviews as a test of recursive backtracking fluency.`,
  },
  {
    id: "13_exhaustive_recursion/03_create_combinations",
    name: "Create Combinations",
    section: "13_exhaustive_recursion",
    usage: `Generating C(n,k) combinations is fundamental to sampling, statistical analysis, and combinatorial optimization. A/B testing platforms at companies like Netflix and Airbnb enumerate combinations of experimental features to design orthogonal test matrices. In pharmaceutical research, drug combination screening tests all C(n,k) subsets of candidate compounds for synergistic effects. Lottery and gaming systems compute combinations to calculate odds and validate ticket distributions. Portfolio managers evaluate combinations of assets to construct diversified investment strategies under constraints. The algorithm uses backtracking with a size constraint, running in O(C(n,k)) time, and understanding the difference between combinations and permutations is critical for modeling problems correctly. It is a standard interview question at Bloomberg, Goldman Sachs, and tech companies.`,
  },
  {
    id: "13_exhaustive_recursion/04_grocery_budget",
    name: "Grocery Budget",
    section: "13_exhaustive_recursion",
    usage: `The grocery budget problem is a practical instance of the subset sum problem, which underlies resource allocation decisions across industries. Cloud infrastructure teams at AWS and Google Cloud solve budget-constrained resource selection when choosing instance types that maximize compute capacity within a spending limit. Marketing teams at companies like HubSpot and Salesforce allocate campaign budgets across channels to maximize ROI, a direct analog of subset sum with value optimization. In meal-planning apps and grocery delivery services like Instacart, the algorithm helps find item combinations that meet nutritional targets within a budget. The problem is NP-complete in its general form, making it a key example for understanding computational complexity. Interviewers use it to test dynamic programming and backtracking with pruning.`,
  },
  {
    id: "13_exhaustive_recursion/05_possible_paths",
    name: "Possible Paths",
    section: "13_exhaustive_recursion",
    usage: `Enumerating all paths in a graph is essential for network analysis, testing, and security auditing. In software testing, path enumeration through control flow graphs ensures complete code coverage, a requirement for safety-critical systems in aerospace (DO-178C) and automotive (ISO 26262) industries. Network engineers at companies like Cisco and Juniper enumerate routing paths to identify redundancy and single points of failure in network topologies. In cybersecurity, attack path enumeration through system dependency graphs helps red teams identify all possible exploitation chains. Game developers enumerate paths through dialogue trees and quest graphs to verify that all player choices lead to valid game states. The exponential growth of paths motivates pruning strategies and is a natural lead-in to dynamic programming optimization.`,
  },
  {
    id: "13_exhaustive_recursion/06_parenthetical_possibilities",
    name: "Parenthetical Possibilities",
    section: "13_exhaustive_recursion",
    usage: `Generating valid parentheses combinations is a classic application of Catalan numbers with direct relevance to compiler design and language parsing. Compilers and syntax checkers count and validate balanced delimiter patterns (parentheses, brackets, braces) in source code, and the generation algorithm models all possible nesting structures. In automated theorem provers and symbolic math engines like Mathematica and SymPy, generating all valid parenthesizations of an expression explores different evaluation orders. Compilers use this concept when deciding how to parenthesize matrix chain multiplications for optimal computation cost. The problem exercises backtracking with constraint-based pruning (open count >= close count), producing exactly the nth Catalan number of results. It is a top-20 most-asked interview question at Google, Meta, and Amazon.`,
  },
  {
    id: "14_graph_ii/01_knight_attack",
    name: "Knight Attack",
    section: "14_graph_ii",
    usage: `The knight attack (minimum moves) problem is a BFS shortest-path problem on an implicit graph that directly applies to game AI and robotics pathfinding. Chess engines like Stockfish and Leela Chess Zero compute knight mobility and minimum move distances as part of their position evaluation functions. In robotics, discrete-grid pathfinding with constrained movement patterns (like L-shaped hops) models real scenarios such as robotic arms with limited joint angles or drones navigating waypoint grids. The problem also demonstrates bidirectional BFS and symmetry-based pruning, optimization techniques used in route planning at companies like Google and Uber. It is a popular interview question at companies that work with games, simulations, or spatial algorithms, and tests the ability to model implicit graphs without explicit adjacency lists.`,
  },
  {
    id: "14_graph_ii/02_can_color",
    name: "Can Color",
    section: "14_graph_ii",
    usage: `Graph 2-coloring (bipartiteness checking) solves the fundamental problem of determining whether a graph can be split into two independent sets. In social networks at companies like Meta and LinkedIn, bipartite detection identifies two-mode relationships (e.g., users and groups, buyers and sellers) for targeted feature development. Compiler register allocators use graph coloring to assign variables to CPU registers, where 2-colorability indicates the simplest allocation case. In scheduling, bipartiteness determines whether tasks can be divided into two non-conflicting shifts. The algorithm extends to map coloring, frequency assignment in telecommunications, and conflict-free resource allocation. BFS or DFS-based 2-coloring runs in O(V+E) time and is a prerequisite for understanding the general graph coloring problem, which is NP-complete for k >= 3.`,
  },
  {
    id: "14_graph_ii/03_tolerant_teams",
    name: "Tolerant Teams",
    section: "14_graph_ii",
    usage: `The tolerant teams problem applies bipartite graph checking to the practical scenario of dividing people into two conflict-free groups. In HR systems at large companies, team-splitting algorithms ensure that conflicting employees are separated across teams, a constraint satisfaction problem modeled as bipartiteness. Online multiplayer games use similar algorithms to balance teams while respecting rivalry or incompatibility constraints. In distributed systems, partitioning nodes into two replication groups with no conflicts ensures consistency in protocols like two-phase commit. Political redistricting tools check bipartiteness of adjacency graphs to validate proposed district boundaries. The problem reduces to BFS-based 2-coloring on the conflict graph, running in O(V+E) time, and tests the ability to model a real-world constraint problem as a graph algorithm.`,
  },
  {
    id: "14_graph_ii/04_rare_routing",
    name: "Rare Routing",
    section: "14_graph_ii",
    usage: `Checking whether a graph is a tree (connected and acyclic) is fundamental to network topology validation. Internet backbone engineers at companies like Akamai and Cloudflare verify that spanning tree protocols produce valid tree topologies without redundant links that could cause broadcast storms. In database schema validation, ensuring referential integrity graphs are tree-structured prevents circular foreign key dependencies. Kubernetes networking validates that service mesh topologies form trees for efficient request routing. The algorithm checks two properties: exactly V-1 edges (or no cycles via DFS/BFS) and full connectivity. It runs in O(V+E) time and is a building block for minimum spanning tree algorithms like Kruskal's and Prim's. Interviewers at networking and infrastructure companies frequently test this concept.`,
  },
  {
    id: "14_graph_ii/05_topological_order",
    name: "Topological Order",
    section: "14_graph_ii",
    usage: `Topological sorting is the algorithm behind dependency resolution in build systems, package managers, and task schedulers across the software industry. Build tools like Make, Gradle, Bazel, and Webpack use topological sort to determine compilation order so that dependencies are always processed before dependents. Package managers including npm, pip, apt, and Homebrew resolve installation order through topological sorting of dependency DAGs. Database migration tools like Flyway and Alembic order schema changes topologically to ensure tables exist before foreign keys reference them. CI/CD pipeline orchestrators at companies like GitHub Actions and GitLab CI use topological ordering to parallelize independent build stages. Kahn's algorithm (BFS-based) and DFS-based approaches both run in O(V+E) and are among the most practically important graph algorithms.`,
  },
  {
    id: "14_graph_ii/06_string_search",
    name: "String Search",
    section: "14_graph_ii",
    usage: `Efficient substring search algorithms like KMP (Knuth-Morris-Pratt) and Rabin-Karp are fundamental to text processing across the software industry. Text editors like VS Code, Vim, and Sublime Text use optimized string matching for find-and-replace operations across large codebases. Plagiarism detection platforms like Turnitin use Rabin-Karp's rolling hash to scan millions of documents for duplicate content. Intrusion detection systems at companies like Palo Alto Networks and CrowdStrike match network packet payloads against known malicious signatures using KMP-style pattern matching. DNA sequence alignment tools in bioinformatics scan genomes for specific gene patterns using these algorithms. KMP achieves O(n+m) worst-case time by precomputing a failure function, while Rabin-Karp excels at multi-pattern search. Both are frequently tested at Google, Amazon, and security-focused companies.`,
  },
  {
    id: "14_graph_ii/07_province_sizes",
    name: "Province Sizes",
    section: "14_graph_ii",
    usage: `Computing connected component sizes is a fundamental graph operation used in social network analysis, epidemiology, and infrastructure monitoring. At Meta and LinkedIn, connected components identify distinct user communities and measure their sizes for engagement analytics and content recommendation. In epidemiological contact tracing (as seen during COVID-19), component sizes in contact graphs determine outbreak cluster sizes and inform quarantine decisions. Network operations centers at AWS and Google Cloud detect infrastructure partitioning by monitoring connected component counts; a spike in components signals network fragmentation requiring immediate attention. In image processing, connected component labeling identifies distinct objects in binary images for computer vision applications. The algorithm runs in O(V+E) using BFS/DFS or Union-Find, and is a common interview question at companies working with graph-structured data.`,
  },
  {
    id: "14_graph_ii/08_extra_cable",
    name: "Extra Cable",
    section: "14_graph_ii",
    usage: `Finding a redundant edge that, if removed, makes a graph a valid tree is directly applicable to network design and failure analysis. Network engineers at companies like Cisco and Juniper identify redundant links in network topologies to optimize spanning tree configurations and prevent broadcast storms. In electrical grid management, identifying extra connections helps utilities simplify grid topology while maintaining connectivity. The problem maps to cycle detection in undirected graphs and is optimally solved using Union-Find (Disjoint Set Union) with path compression and union by rank, achieving near-O(V) amortized time. Kruskal's minimum spanning tree algorithm uses this exact operation to skip edges that would create cycles. In database systems, detecting circular foreign key dependencies uses the same underlying algorithm. This problem tests Union-Find proficiency, a data structure frequently asked about at Google, Amazon, and Microsoft.`,
  },
  {
    id: "14_graph_ii/09_weighted_graph_min_path",
    name: "Weighted Graph Min Path",
    section: "14_graph_ii",
    usage: `Dijkstra's algorithm for shortest paths in weighted graphs is one of the most widely deployed algorithms in production systems worldwide. Google Maps, Apple Maps, and Waze use Dijkstra's algorithm (and its A* variant) to compute optimal driving routes for billions of queries daily. Internet routing protocols like OSPF (Open Shortest Path First) and IS-IS run Dijkstra's algorithm on every router to compute forwarding tables across autonomous systems. Ride-sharing platforms like Uber and Lyft use Dijkstra-based routing to estimate trip times and optimize driver dispatch. CDN providers like Cloudflare and Akamai compute shortest network paths to route user requests to the nearest edge server. The algorithm runs in O((V+E) log V) with a binary heap, or O(V^2) with a simple array. It is arguably the single most important graph algorithm in industry and a guaranteed interview topic at every major tech company.`,
  },
  {
    id: "15_mixed_recall/01_prefix_product",
    name: "Prefix Product",
    section: "15_mixed_recall",
    usage: `The product-of-array-except-self problem demonstrates prefix/suffix precomputation, a technique used broadly in data processing and parallel computing. GPU shader programs in graphics engines like Unity and Unreal use prefix sums (and products) for parallel scan operations that power particle systems and physics simulations. In financial analytics at companies like Bloomberg and Citadel, prefix products compute cumulative returns, and the except-self variant calculates the impact of removing individual assets from a portfolio. Database query engines use prefix aggregation to accelerate window functions in SQL (e.g., running products in OVER clauses). The constraint of solving without division makes this problem test creative algorithmic thinking, since the naive division approach fails on zeros. It is a top-20 most-asked array question at Amazon, Google, and Meta interviews.`,
  },
  {
    id: "15_mixed_recall/02_max_increasing_subseq",
    name: "Max Increasing Subseq",
    section: "15_mixed_recall",
    usage: `The longest increasing subsequence (LIS) problem is a cornerstone of dynamic programming with applications in data analysis, bioinformatics, and systems engineering. In genome alignment, the MUMmer system uses LIS to find the longest chain of matching anchors between two genomes, enabling whole-genome comparison. In stock market analysis, LIS length measures uptrend stability and helps quantitative traders at firms like Two Sigma and Jane Street identify sustained growth patterns. Version control systems use LIS-related algorithms in their diff implementations (patience diff uses patience sorting, which solves LIS as a subroutine). Process control systems use LIS as a trend detection marker in measurement sequences. The O(n log n) solution using patience sorting with binary search is expected knowledge at top-tier interviews. It is a frequent question at Google, Amazon, and trading firms.`,
  },
  {
    id: "15_mixed_recall/03_has_path_sum",
    name: "Has Path Sum",
    section: "15_mixed_recall",
    usage: `Checking whether a root-to-leaf path with a target sum exists in a binary tree models hierarchical decision-making and budget allocation. In decision tree classifiers used by ML frameworks like scikit-learn and XGBoost, path sums from root to leaf represent cumulative feature thresholds that determine classification outcomes. Financial planning tools at companies like Intuit (TurboTax) traverse hierarchical tax category trees, summing deductions along paths to determine eligibility. Network routing protocols compute cumulative link costs along paths through routing trees to determine whether a path meets latency budgets. In game AI, skill trees in RPGs (World of Warcraft, Path of Exile) check whether a sequence of upgrades from root to a desired ability node fits within a point budget. The recursive solution runs in O(n) time and is a common warm-up tree question at Amazon, Google, and Microsoft.`,
  },
  {
    id: "15_mixed_recall/04_knapsack",
    name: "Knapsack",
    section: "15_mixed_recall",
    usage: `The 0/1 knapsack problem is one of the most studied optimization problems in computer science, with direct applications across logistics, finance, and resource management. Logistics companies like FedEx, UPS, and Amazon optimize cargo loading to maximize the value of goods shipped within weight and volume constraints, a direct knapsack formulation. Cloud providers like AWS solve knapsack variants when bin-packing virtual machines onto physical servers to maximize resource utilization. Venture capital firms and portfolio managers at BlackRock model investment selection as a knapsack problem, choosing projects that maximize expected returns within a capital budget. The dynamic programming solution runs in O(nW) pseudo-polynomial time, and understanding why this is not truly polynomial (due to the W factor) is key to grasping NP-completeness. This problem appears at Amazon, Google, and finance-focused companies like Goldman Sachs and Citadel.`,
  },
  {
    id: "15_mixed_recall/05_flatten_tree",
    name: "Flatten Tree",
    section: "15_mixed_recall",
    usage: `Flattening a binary tree into a linked list (in preorder) is a tree-to-list transformation used in serialization, memory optimization, and iterator design. Database storage engines flatten tree-structured indexes into sequential layouts for cache-friendly disk access; LevelDB and RocksDB flatten sorted tree indexes into SSTable files during compaction. Compilers flatten ASTs into linear intermediate representations (three-address code or SSA form) for optimization passes. The Morris traversal approach achieves O(1) space by threading the tree, a technique used in memory-constrained embedded systems. UI frameworks like React flatten component trees into fiber linked lists for efficient reconciliation during re-renders. This problem tests in-place tree manipulation skills and is commonly asked at Meta, Google, and Amazon, often with follow-up questions about restoring the original tree.`,
  },
  {
    id: "legacy/anagrams",
    name: "Anagrams",
    section: "legacy",
    usage: `Anagram detection using character frequency counting is a foundational hashing technique used in search engines, natural language processing, and security. Search engines like Google use anagram-aware indexing to handle query misspellings and suggest alternative word arrangements. Spell checkers in productivity tools like Grammarly and Microsoft Word use character frequency signatures to suggest corrections that are anagrams or near-anagrams of misspelled words. In cryptanalysis, frequency analysis of character distributions (a generalization of anagram detection) is used to break substitution ciphers. Scrabble and word-game engines like Words With Friends use optimized anagram lookups against dictionaries to validate plays and suggest moves. The O(n) solution using a hash map or character count array is one of the most common beginner interview questions at Amazon, Google, and Microsoft.`,
  },
  {
    id: "legacy/pair_product",
    name: "Pair Product",
    section: "legacy",
    usage: `Finding a pair of elements with a target product is a hash-based lookup pattern used in data analysis, signal processing, and financial computations. In e-commerce recommendation engines at companies like Amazon and Shopify, pair-product-style lookups identify complementary products whose combined metrics match a target profile. Signal processing systems use similar multiplicative pair searches when deconvolving signals or finding frequency pairs whose product equals a target harmonic. In number theory and cryptography, factoring algorithms search for integer pairs whose product equals a target composite number, which is the basis of RSA security. The O(n) hash-set solution mirrors the pair-sum technique and tests the same fundamental insight: transforming a nested search into a single-pass lookup. It is a common warm-up interview problem at tech companies to verify hash table fluency.`,
  },
  {
    id: "legacy/zipper_list",
    name: "Zipper List",
    section: "legacy",
    usage: `Interleaving (zippering) two linked lists is a merge operation that models time-division multiplexing and round-robin scheduling in systems programming. Network multiplexers at companies like Cisco interleave packets from multiple streams into a single output channel, directly analogous to the zipper merge operation. Operating system schedulers implement round-robin process switching by interleaving task nodes from separate ready queues. Audio processing systems in DAWs like Ableton and Pro Tools interleave samples from stereo channels (left/right) into a single interleaved PCM stream for playback. In web servers like Nginx, connection-handling threads interleave requests from multiple client queues for fair processing. The in-place O(m+n) solution tests careful pointer manipulation and is a good proxy for real systems programming tasks. It appears in interviews at companies that deal with streaming data and concurrent I/O.`,
  },
];
