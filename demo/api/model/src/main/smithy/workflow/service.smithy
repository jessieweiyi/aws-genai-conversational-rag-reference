$version: "2"

namespace com.amazon

use aws.protocols#restJson1

@mixin
@restJson1
service WorkflowsService {
    version: "1.0"
    resources: [
        WorkflowsResource
    ]
}