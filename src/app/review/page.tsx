import { ReviewForm } from "./review-form";

export default function ReviewPage(){
    return (
        <main className="mx-auto max-w-3xl p-8">
            <h1 className="text-3xl font-semibold">Review a diff</h1>
            <ReviewForm />
        </main>
    );
}
