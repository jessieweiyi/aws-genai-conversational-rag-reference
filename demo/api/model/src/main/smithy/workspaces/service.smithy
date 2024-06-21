$version: "2"

namespace com.amazon

use aws.protocols#restJson1

@mixin
@restJson1
service WorkspacesService {
    version: "1.0"
    resources: [
        WorkspacesResource
    ]
}