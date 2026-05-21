import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ContinueCard() {
  return (
    <Card className="bg-[#E5E5E5] border-none shadow-lg h-80">
      <CardHeader className="pb-2">
        <CardTitle className="text-black text-lg">Continue</CardTitle>
        <p className="text-sm text-gray-500 font-medium">Recent video</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Placeholder 1 */}
        <div className="flex gap-3 bg-white p-2 rounded-md">
          <div className="w-16 h-10 bg-gray-400 rounded"></div>
          <div className="flex-1 space-y-1">
            <div className="h-3 w-3/4 bg-gray-300 rounded"></div>
            <div className="h-2 w-full bg-gray-200 rounded">
              <div className="h-full w-[45%] bg-[#00E5FF] rounded"></div>
            </div>
            <p className="text-[10px] text-gray-500">% complete: 45%</p>
          </div>
        </div>
        
        {/* Video Placeholder 2 */}
        <div className="flex gap-3 bg-white p-2 rounded-md">
          <div className="w-16 h-10 bg-gray-400 rounded"></div>
          <div className="flex-1 space-y-1">
            <div className="h-3 w-3/4 bg-gray-300 rounded"></div>
            <div className="h-2 w-full bg-gray-200 rounded">
              <div className="h-full w-[5%] bg-[#00E5FF] rounded"></div>
            </div>
            <p className="text-[10px] text-gray-500">% complete: 5%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}