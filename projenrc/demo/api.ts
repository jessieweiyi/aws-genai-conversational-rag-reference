import * as path from 'node:path';
import { MonorepoTsProject, NxProject } from '@aws/pdk/monorepo';
import {
  DocumentationFormat,
  Language,
  Library,
  ModelLanguage,
  TypeSafeApiProject,
  TypeSafeWebSocketApiProject,
  WebSocketLibrary,
} from '@aws/pdk/type-safe-api';
import { TypeScriptProject } from 'projen/lib/typescript';
import { DEFAULT_RELEASE_BRANCH, PROJECT_AUTHOR } from '../constants';
import { NodePackageManager, TypeScriptJsxMode, TypeScriptModuleResolution, TypescriptConfigOptions } from 'projen/lib/javascript';

export interface ApiOptions {
  readonly monorepo: MonorepoTsProject;
  readonly rootOutdir: string;
  readonly serviceName?: string;
}

export class Api {
  public readonly project: TypeSafeApiProject;
  public readonly wsApiProject: TypeSafeWebSocketApiProject;
  public readonly apiInterceptorsTs: TypeScriptProject;

  constructor(options: ApiOptions) {
    const { monorepo, rootOutdir, serviceName = 'MyApi' } = options;

    // config to conform with website config
    const commonTsConfig: TypescriptConfigOptions = {
      compilerOptions: {
        jsx: TypeScriptJsxMode.REACT_JSX,
        lib: ['ES2019', 'ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ES6',
        target: 'ES6',
        moduleResolution: TypeScriptModuleResolution.NODE,
      },
    }

    this.project = new TypeSafeApiProject({
      parent: monorepo,
      outdir: path.join(rootOutdir, 'api'),
      name: 'api',
      model: {
        language: ModelLanguage.SMITHY,
        options: {
          smithy: {
            serviceName: {
              namespace: 'com.amazon',
              serviceName,
            },
          },
        },
      },
      runtime: {
        languages: [Language.TYPESCRIPT, Language.PYTHON],
      },
      infrastructure: {
        language: Language.TYPESCRIPT,
      },
      library: {
        libraries: [Library.TYPESCRIPT_REACT_QUERY_HOOKS],
        options: {
          typescriptReactQueryHooks: {
            tsconfig: commonTsConfig,
          }
        }
      },
      documentation: {
        formats: [DocumentationFormat.HTML2],
      },
    });
    this.project.runtime.typescript!.package.addField('private', true);

    // TODO: starting from PDK v0.23.14 this line would cause build error.
    // TODO: introduce it back once https://github.com/aws/aws-pdk/issues/751 is fixed
    // this.project.runtime.python!.addDependency('python@>=3.10,<4.0');
    this.project.runtime.python!.addDependency('python@^3.10');

    this.project.runtime.python!.addDependency('certifi@^2023.5.7');
    this.project.runtime.python!.addDependency('urllib3@>=1.25.4,<1.27');
    this.project.runtime.python!.addDependency('typing_extensions@^4.7.1');
    // Initial build fails intermittency stating this file is missing, no sure why it is needed.
    // For now adding to commit so persists.
    this.project.runtime.python!.gitignore.include('README.md');

    this.wsApiProject = new TypeSafeWebSocketApiProject({
      parent: monorepo,
      outdir: path.join(rootOutdir, 'ws-api'),
      name: 'ws-api',
      model: {
        language: ModelLanguage.SMITHY,
        options: {
          smithy: {
            serviceName: {
              namespace: 'com.amazon',
              serviceName: 'WsApi',
            },
          },
        },
      },
      infrastructure: {
        language: Language.TYPESCRIPT,
      },
      handlers: {
        languages: [Language.TYPESCRIPT],
        options: {
          typescript: {
            deps: [
              'aws-jwt-verify',
              '@aws-sdk/client-dynamodb',
              '@aws-sdk/lib-dynamodb',
            ],
            devDeps: [
              '@aws-sdk/types',
              '@smithy/types',
            ]
          }
        }
      },
      library: {
        libraries: [WebSocketLibrary.TYPESCRIPT_WEBSOCKET_HOOKS],
        options: {
          typescriptWebSocketHooks: {
            tsconfig: commonTsConfig,
          },
          typescriptWebSocketClient: {
            tsconfig: commonTsConfig,
          }
        }
      },
    });

    monorepo.vscode?.settings.addSetting(
      'smithyLsp.rootPath',
      '${workspaceRoot}/' + path.relative(monorepo.outdir, this.project.model.outdir),
    );

    NxProject.ensure(this.project.model)?.addBuildTargetFiles(
      ['!{projectRoot}/.gradle/**/*'],
      ['{projectRoot}/.api.json', '{projectRoot}/.gradle'],
    );
    NxProject.ensure(this.project.documentation.html2!)?.addBuildTargetFiles(
      ['!{projectRoot}/index.html', '!{projectRoot}/.openapi-generator/**/*'],
      ['{projectRoot}/index.html'],
    );
    NxProject.ensure(this.project.infrastructure.typescript!).addBuildTargetFiles(
      [],
      ['{projectRoot}/mocks', '{projectRoot}/assets'],
    );
    NxProject.ensure(this.project.library.typescriptReactQueryHooks!).addImplicitDependency(
      this.project.runtime.typescript!,
    );

    // Extend api runtime libraries with interceptors and other functionality
    this.apiInterceptorsTs = new TypeScriptProject({
      ...PROJECT_AUTHOR,
      parent: monorepo,
      prettier: true,
      outdir: 'demo/api/interceptors/typescript',
      name: 'api-typescript-interceptors',
      packageManager: NodePackageManager.PNPM,
      defaultReleaseBranch: DEFAULT_RELEASE_BRANCH,
      npmignoreEnabled: false,
      deps: [
        '@aws-lambda-powertools/logger',
        '@aws-lambda-powertools/tracer',
        '@aws-sdk/client-cognito-identity-provider',
        'jose',
        'nanoid',
        'node-cache',
        'node-fetch',
        this.project.runtime.typescript!.package.packageName,
      ],
      devDeps: [
        '@aws-sdk/types',
        '@types/aws-lambda',
        '@types/node-fetch',
        'aws-lambda',
        'aws-sdk-client-mock',
        'mock-jwks',
      ],
      tsconfig: {
        compilerOptions: {
          lib: ['dom', 'ES2019'],
          skipLibCheck: true,
          target: 'ES2019',
        },
      },
      tsconfigDev: {
        compilerOptions: {
          lib: ['dom', 'ES2019'],
          skipLibCheck: true,
          target: 'ES2019',
        },
      },
    });
    this.apiInterceptorsTs.package.addField('private', true);
  }
}
