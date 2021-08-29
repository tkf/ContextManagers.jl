var documenterSearchIndex = {"docs":
[{"location":"#ContextManagers.jl","page":"ContextManagers.jl","title":"ContextManagers.jl","text":"","category":"section"},{"location":"","page":"ContextManagers.jl","title":"ContextManagers.jl","text":"ContextManagers\nContextManagers.@with\nContextManagers.with","category":"page"},{"location":"#ContextManagers","page":"ContextManagers.jl","title":"ContextManagers","text":"ContextManagers\n\nContextManagers.jl provides composable resource management interface for Julia.\n\nusing ContextManagers: @with, opentemp, onexit\n\nlck = ReentrantLock()\nch = Channel()\n\n@with(\n    lck,\n    (path, io) = opentemp(),\n    onexit(lock(ch)) do _\n        unlock(ch)\n        println(\"Successfully unlocked!\")\n    end,\n) do\n    println(io, \"Hello World\")\nend\n\n# output\nSuccessfully unlocked!\n\nSee also:\n\nhttps://github.com/c42f/ResourceContexts.jl\n\n\n\n\n\n","category":"module"},{"location":"#ContextManagers.@with","page":"ContextManagers.jl","title":"ContextManagers.@with","text":"@with(\n    resource₁ = source₁,\n    resource₂ = source₂,\n    ...\n    resourceₙ = sourceₙ,\n) do\n    use(resource₁, resource₂, ..., resourceₙ)\nend\n\nOpen resources, run the do block body, and cleanup the resources.\n\n\n\n\n\n","category":"macro"},{"location":"#ContextManagers.with","page":"ContextManagers.jl","title":"ContextManagers.with","text":"ContextManagers.with(sources...) do resources...\n    use(resources...)\nend\n\nOpen resources, run the do block body, and cleanup the resources.\n\n\n\n\n\n","category":"function"},{"location":"#Tools","page":"ContextManagers.jl","title":"Tools","text":"","category":"section"},{"location":"","page":"ContextManagers.jl","title":"ContextManagers.jl","text":"ContextManagers.opentemp\nContextManagers.opentempdir\nContextManagers.SharedResource\nContextManagers.IgnoreError\nContextManagers.onexit\nContextManagers.onfail","category":"page"},{"location":"#ContextManagers.opentemp","page":"ContextManagers.jl","title":"ContextManagers.opentemp","text":"ContextManagers.opentemp([parent]; kwargs...) -> tf\n\nCreate and open a temporary file. The path and the IO object can be accessed through the properties .path and .io of the returned object tf respectively. The positional and named arguments are passed to mktemp.  The file is automatically removed and the IO object is automatically closed when used with @with or with.\n\n\n\n\n\n","category":"function"},{"location":"#ContextManagers.opentempdir","page":"ContextManagers.jl","title":"ContextManagers.opentempdir","text":"ContextManagers.opentempdir(parent=tempdir(); kwargs...) -> td\n\nCreate aa temporary directory. The path can be accessed through the property .path  of the returned object td. When this is used with @with or with, td is unwrapped to a path automatically. For example, in the do block of @with(paath = opentempdir()) do; ...; end, a string path is available.\n\n\n\n\n\n","category":"function"},{"location":"#ContextManagers.SharedResource","page":"ContextManagers.jl","title":"ContextManagers.SharedResource","text":"ContextManagers.SharedResource(source)\n\nCreate a sharable resource that is closed once the \"last\" context using the shared resource is closed.\n\nwarning: Warning\nThe source itself should produce \"thread-safe\" API if this is shared between @spawned task.\n\nSharedResource supports the following pattern\n\nusing Base.Threads: @spawn\nusing ContextManagers: @with, SharedResource\n\noutput = Int[]\n@sync begin\n    ch = Channel()\n    @with(handle = SharedResource(ch)) do       # (1) create a `handle`\n        for x in 1:3\n            context = open(handle)              # (2) refcount++\n            @spawn begin\n                @with(ch = context) do          # (3) obtain the `ch` value\n                    put!(ch, x)\n                end                             # (4a) refcount--; maybe cleanup\n            end\n        end\n    end                                         # (4b) refcount--; maybe cleanup\n    append!(output, ch)\nend\n\nsort!(output)\n\n# output\n3-element Vector{Int64}:\n 1\n 2\n 3\n\nExtended help\n\n(1) The underling source is entered when SharedResource is entered.  A handle to this shared resource can be obtained by entering the context of the SharedResource.\n\n(2) A context for obtaining the value of the context of the original source can be obtained by open the handle. When sharing the resource across tasks, it typically has to be done before spawning the task.\n\n(3) The value from the original source can be obtained by entering the context.\n\n(4) The last shared context exitting the @with block ends the original context.  In the above pattern, the context of the source may exit at the end (4b) of the outer @with if xs is empty or all the child tasks exit first.\n\nNotes\n\nThis is inspired by Nathaniel J. Smith's comment: https://github.com/python-trio/trio/issues/719#issuecomment-462119589\n\n\n\n\n\n","category":"type"},{"location":"#ContextManagers.IgnoreError","page":"ContextManagers.jl","title":"ContextManagers.IgnoreError","text":"ContextManagers.IgnoreError()\n\nIgnore an error (if any).\n\nExample\n\njulia> using ContextManagers: @with, IgnoreError\n\njulia> @with(\n           IgnoreError(),\n       ) do\n           error(\"error\")\n       end\n\nExtended help\n\nNote that IgnoreError only ignores the error from the \"inner\" code.  That is to say, in the following code, the error from the doblock and the context managers c and d are ignored but not the error from the context managers a and b.\n\n@with(\n    a,\n    b,\n    IgnoreError(),\n    c,\n    d,\n) do\n    doblock\nend\n\n\n\n\n\n","category":"type"},{"location":"#ContextManagers.onexit","page":"ContextManagers.jl","title":"ContextManagers.onexit","text":"ContextManagers.onexit(cleanup, x)\n\nCreate a context manager that runs cleanup(x) upon exit.\n\nExample\n\njulia> using ContextManagers: @with, onexit\n\njulia> @with(\n           onexit(111) do x\n               @show x\n           end,\n       ) do\n       end;\nx = 111\n\n\n\n\n\n","category":"function"},{"location":"#ContextManagers.onfail","page":"ContextManagers.jl","title":"ContextManagers.onfail","text":"ContextManagers.onfail(cleanup, x)\n\nCreate a context manager that runs cleanup(x) upon unsuccessful exit.\n\nExample\n\njulia> using ContextManagers: @with, IgnoreError, onfail\n\njulia> @with(\n           onfail(111) do x\n               @show x\n           end,\n       ) do\n       end;  # prints nothing\n\njulia> @with(\n           IgnoreError(),\n           onfail(111) do x\n               @show x\n           end,\n       ) do\n           error(\"error\")\n       end;\nx = 111\n\n\n\n\n\n","category":"function"},{"location":"#Interface","page":"ContextManagers.jl","title":"Interface","text":"","category":"section"},{"location":"","page":"ContextManagers.jl","title":"ContextManagers.jl","text":"ContextManagers.maybeenter\nContextManagers.value\nContextManagers.exit","category":"page"},{"location":"#ContextManagers.maybeenter","page":"ContextManagers.jl","title":"ContextManagers.maybeenter","text":"ContextManagers.maybeenter(source) -> context or nothing\n\nStart a context managing the resource. Or return nothing when source does not implement the context manager interface.\n\nDefault implementation returns nothing; i.e., no context manager interface.\n\n\n\n\n\n","category":"function"},{"location":"#ContextManagers.value","page":"ContextManagers.jl","title":"ContextManagers.value","text":"ContextManagers.value(context) -> resource\n\nDefault implementation is a pass-through (identity) function.\n\n\n\n\n\n","category":"function"},{"location":"#ContextManagers.exit","page":"ContextManagers.jl","title":"ContextManagers.exit","text":"ContextManagers.exit(context)\nContextManagers.exit(context, err) -> nothing or ContextManagers.Handled()\n\nCleanup the context.  Default implementation is close.\n\nRoughly speaking,\n\n@with(resource = f(args...)) do\n    use(resource)\nend\n\nis equivalent to\n\ncontext = something(ContextManagers.maybeenter(source))\ntry\n    resource = ContextManagers.value(context)\n\n    use(resource)\n\nfinally\n    ContextManagers.exit(context)\nend\n\nIn the two-argument version ContextManagers.exit(context, err) (where err is nothing or an Exception), the error can be suppressed by returning ContextManagers.Handled().\n\n\n\n\n\n","category":"function"}]
}
